import "server-only";

import { randomUUID } from "crypto";

import { assertAdminAuthenticated } from "@/lib/admin-auth";
import { getDb, parseJsonObject } from "@/lib/db";
import {
  convertAmount,
  formatAmount,
  normalizeCurrencyCode,
} from "@/lib/utils";

export const EXPENSE_CATEGORIES = [
  "inventory",
  "shipping",
  "ads",
  "packaging",
  "repair",
  "fees",
  "rent",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

function createEntityId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").toUpperCase().slice(0, 26)}`;
}

function formatAdminDate(value: string | Date | null) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

async function ensureFinanceSchema() {
  const db = await getDb();

  await db
    .prepare(
      "create table if not exists finance_expenses (id text primary key, expense_date text not null, category text not null, amount integer not null default 0, currency_code text not null default 'usd', note text, created_at text not null default (datetime('now')), updated_at text not null default (datetime('now')), deleted_at text)",
    )
    .run();
  await db.exec(
    "create index if not exists idx_finance_expenses_date on finance_expenses(expense_date)",
  );
  await db.exec(
    "create index if not exists idx_finance_expenses_deleted_at on finance_expenses(deleted_at)",
  );

  return db;
}

function metadataNumber(metadata: Record<string, unknown> | null, key: string) {
  const value = metadata?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getUnitCost(metadata: Record<string, unknown> | null) {
  return (
    metadataNumber(metadata, "unit_cost_amount") +
    metadataNumber(metadata, "unit_shipping_cost_amount") +
    metadataNumber(metadata, "unit_other_cost_amount")
  );
}

function isPaidStatus(status?: string | null) {
  return status === "captured" || status === "paid";
}

function toTitleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export async function getAdminFinanceData() {
  await assertAdminAuthenticated();

  try {
    const db = await ensureFinanceSchema();
    const orderItems = await db
      .prepare(
        `
          select
            o.id as order_id,
            o.display_id,
            o.created_at,
            o.total_amount,
            o.currency_code as order_currency_code,
            o.payment_status,
            oi.title,
            oi.unit_price,
            oi.quantity,
            p.metadata_json
          from orders o
          left join order_items oi on oi.order_id = o.id
          left join products p on p.id = oi.product_id
          order by o.created_at desc
        `,
      )
      .all<{
        order_id: string;
        display_id: number | null;
        created_at: string;
        total_amount: number;
        order_currency_code: string;
        payment_status: string | null;
        title: string | null;
        unit_price: number | null;
        quantity: number | null;
        metadata_json: string | null;
      }>();

    const expenses = await db
      .prepare(
        `
          select id, expense_date, category, amount, currency_code, note
          from finance_expenses
          where deleted_at is null
          order by expense_date desc, created_at desc
        `,
      )
      .all<{
        id: string;
        expense_date: string;
        category: string;
        amount: number;
        currency_code: string;
        note: string | null;
      }>();

    const orderSummaries = new Map<
      string,
      {
        id: string;
        displayId: string;
        date: string;
        revenue: number;
        profitEligibleRevenue: number;
        cost: number;
        paidRevenue: number;
        paymentStatus: string;
        itemSummary: string;
        missingCostProducts: string[];
      }
    >();
    let revenue = 0;
    let profitEligibleRevenue = 0;
    let paidRevenue = 0;
    let costOfGoods = 0;
    let missingCostItems = 0;
    const missingCostProducts = new Map<
      string,
      { title: string; count: number }
    >();

    for (const row of orderItems) {
      const orderRevenue = convertAmount(
        row.total_amount ?? 0,
        row.order_currency_code,
        "usd",
      );
      let order = orderSummaries.get(row.order_id);

      if (!order) {
        const paymentStatus = row.payment_status || "awaiting";
        order = {
          id: row.order_id,
          displayId: row.display_id ? `#${row.display_id}` : "Draft",
          date: formatAdminDate(row.created_at),
          revenue: orderRevenue,
          profitEligibleRevenue: 0,
          cost: 0,
          paidRevenue: isPaidStatus(paymentStatus) ? orderRevenue : 0,
          paymentStatus,
          itemSummary: row.title || "No items",
          missingCostProducts: [],
        };
        orderSummaries.set(row.order_id, order);
        revenue += orderRevenue;

        if (isPaidStatus(paymentStatus)) {
          paidRevenue += orderRevenue;
        }
      } else if (row.title && order.itemSummary === "No items") {
        order.itemSummary = row.title;
      }

      const quantity = row.quantity ?? 0;
      const lineRevenue = convertAmount(
        (row.unit_price ?? 0) * quantity,
        row.order_currency_code,
        "usd",
      );
      const unitCost = getUnitCost(parseJsonObject(row.metadata_json));
      const lineCost = unitCost * quantity;

      if (quantity > 0 && unitCost <= 0) {
        missingCostItems += 1;
        const productTitle = row.title || "Untitled product";
        const existingMissingProduct = missingCostProducts.get(productTitle);
        missingCostProducts.set(productTitle, {
          title: productTitle,
          count: (existingMissingProduct?.count || 0) + quantity,
        });
        if (!order.missingCostProducts.includes(productTitle)) {
          order.missingCostProducts.push(productTitle);
        }
      } else {
        order.profitEligibleRevenue += lineRevenue;
        profitEligibleRevenue += lineRevenue;
      }

      order.cost += lineCost;
      costOfGoods += lineCost;
    }

    const expenseTotal = expenses.reduce(
      (sum, expense) =>
        sum + convertAmount(expense.amount, expense.currency_code, "usd"),
      0,
    );
    const grossProfit = profitEligibleRevenue - costOfGoods;
    const netProfit = grossProfit - expenseTotal;
    const grossMargin =
      profitEligibleRevenue > 0
        ? Math.round((grossProfit / profitEligibleRevenue) * 100)
        : 0;
    const orderCount = orderSummaries.size;
    const averageOrderValue =
      orderCount > 0 ? Math.round(revenue / orderCount) : 0;

    return {
      errorMessage: "",
      stats: [
        { label: "Revenue", value: formatAmount(revenue, "usd") },
        { label: "Paid Revenue", value: formatAmount(paidRevenue, "usd") },
        {
          label: "Profit-Tracked Revenue",
          value: formatAmount(profitEligibleRevenue, "usd"),
        },
        { label: "Product Costs", value: formatAmount(costOfGoods, "usd") },
        { label: "Gross Profit", value: formatAmount(grossProfit, "usd") },
        { label: "Expenses", value: formatAmount(expenseTotal, "usd") },
        { label: "Net Profit", value: formatAmount(netProfit, "usd") },
      ],
      summary: {
        orderCount,
        missingCostItems,
        missingCostProducts: Array.from(missingCostProducts.values()).sort(
          (a, b) => a.title.localeCompare(b.title),
        ),
        grossMargin,
      },
      recentOrders: Array.from(orderSummaries.values())
        .slice(0, 8)
        .map((order) => ({
          ...order,
          revenueLabel: formatAmount(order.revenue, "usd"),
          costLabel: formatAmount(order.cost, "usd"),
          profitLabel:
            order.missingCostProducts.length > 0
              ? "Needs cost data"
              : formatAmount(order.profitEligibleRevenue - order.cost, "usd"),
        })),
      expenses: expenses.map((expense) => ({
        id: expense.id,
        date: formatAdminDate(expense.expense_date),
        category: toTitleCase(expense.category),
        amount: formatAmount(
          convertAmount(expense.amount, expense.currency_code, "usd"),
          "usd",
        ),
        note: expense.note || "",
      })),
    };
  } catch (error) {
    console.error("Unable to load finance data.", error);

    return {
      errorMessage:
        "Finance data could not be loaded. Check Cloudflare logs for the exact database or runtime error.",
      stats: [
        { label: "Revenue", value: formatAmount(0, "usd") },
        { label: "Paid Revenue", value: formatAmount(0, "usd") },
        { label: "Product Costs", value: formatAmount(0, "usd") },
        { label: "Gross Profit", value: formatAmount(0, "usd") },
        { label: "Expenses", value: formatAmount(0, "usd") },
        { label: "Net Profit", value: formatAmount(0, "usd") },
        { label: "Gross Margin", value: "0%" },
        { label: "Average Order", value: formatAmount(0, "usd") },
      ],
      summary: {
        orderCount: 0,
        missingCostItems: 0,
        missingCostProducts: [],
        grossMargin: 0,
      },
      recentOrders: [],
      expenses: [],
    };
  }
}

export async function createFinanceExpense(input: {
  expenseDate: string;
  category: string;
  amount: number;
  currencyCode: string;
  note?: string;
}) {
  await assertAdminAuthenticated();

  const db = await ensureFinanceSchema();
  const category = input.category.trim().toLowerCase();

  if (!EXPENSE_CATEGORIES.includes(category as ExpenseCategory)) {
    throw new Error("Expense category is invalid.");
  }

  if (!input.expenseDate || Number.isNaN(Date.parse(input.expenseDate))) {
    throw new Error("Expense date is invalid.");
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Expense amount must be greater than zero.");
  }

  const currencyCode = normalizeCurrencyCode(input.currencyCode);

  await db
    .prepare(
      `
        insert into finance_expenses (
          id, expense_date, category, amount, currency_code, note, created_at, updated_at
        )
        values (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `,
    )
    .run([
      createEntityId("exp"),
      input.expenseDate,
      category,
      Math.round(input.amount),
      currencyCode,
      input.note?.trim() || null,
    ]);
}

export async function deleteFinanceExpense(expenseId: string) {
  await assertAdminAuthenticated();

  const db = await ensureFinanceSchema();
  const normalizedId = expenseId.trim();

  if (!normalizedId) {
    throw new Error("Expense id is required.");
  }

  await db
    .prepare(
      "update finance_expenses set deleted_at = datetime('now'), updated_at = datetime('now') where id = ? and deleted_at is null",
    )
    .run([normalizedId]);
}
