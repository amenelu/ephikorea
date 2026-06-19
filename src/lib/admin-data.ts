import "server-only";

import { randomUUID } from "crypto";

import {
  buildProductMetadata,
  fetchReferenceSpecSections,
  fetchReferenceSpecs,
  getEditableProductFacts,
  sanitizeHttpUrl,
} from "@/lib/product-specs";
import { assertAdminAuthenticated } from "@/lib/admin-auth";
import { getDb, parseJsonObject, stringifyJson } from "@/lib/db";
import { convertAmount, formatAmount, normalizeCurrencyCode } from "@/lib/utils";

function formatAdminDate(value: string | Date | null) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function toStatusTone(status?: string | null) {
  switch (status?.toLowerCase()) {
    case "completed":
    case "captured":
    case "paid":
    case "published":
      return "bg-green-100 text-green-700";
    case "processing":
    case "pending":
    case "requires_action":
    case "awaiting":
      return "bg-yellow-100 text-yellow-700";
    case "canceled":
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
}

function createEntityId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").toUpperCase().slice(0, 26)}`;
}

function slugifyHandle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function getSetting(key: string, fallback: string) {
  const db = await getDb();
  const row = await db
    .prepare("select value from settings where key = ?")
    .get<{ value: string }>([key]);

  return row?.value || fallback;
}

async function getUniqueProductHandle(
  db: Awaited<ReturnType<typeof getDb>>,
  rawHandle: string,
  excludeProductId?: string,
) {
  const baseHandle = slugifyHandle(rawHandle) || `product-${Date.now()}`;
  let candidate = baseHandle;
  let suffix = 2;

  while (true) {
    const existing = await db
      .prepare(
        `
          select id
          from products
          where handle = ?
            and deleted_at is null
            and (? is null or id <> ?)
          limit 1
        `,
      )
      .get<{ id: string }>([candidate, excludeProductId || null, excludeProductId || null]);

    if (!existing) {
      return candidate;
    }

    candidate = `${baseHandle}-${suffix}`;
    suffix += 1;
  }
}

export async function getAdminDashboardData() {
  await assertAdminAuthenticated();

  const db = await getDb();
  const snapshot = (await db
    .prepare(
      `
        select
          (select count(*) from products where deleted_at is null) as product_count,
          (select count(*) from customers where deleted_at is null) as customer_count,
          (select count(*) from orders) as order_count,
          (select coalesce(sum(total_amount), 0) from orders) as revenue_total,
          (
            select count(*)
            from orders
            where payment_status in ('pending', 'requires_action', 'awaiting')
              or fulfillment_status in ('not_fulfilled', 'partially_fulfilled')
          ) as pending_order_count,
          (
            select count(*)
            from products p
            join product_variants pv on pv.product_id = p.id and pv.deleted_at is null
            where p.deleted_at is null and pv.inventory_quantity <= 3
          ) as low_stock_count,
          (
            select min(pv.inventory_quantity)
            from products p
            join product_variants pv on pv.product_id = p.id and pv.deleted_at is null
            where p.deleted_at is null and pv.inventory_quantity <= 3
          ) as lowest_inventory
      `,
    )
    .get<{
    product_count: number;
    customer_count: number;
    order_count: number;
    revenue_total: number;
    pending_order_count: number;
    low_stock_count: number;
    lowest_inventory: number | null;
  }>()) || {
    product_count: 0,
    customer_count: 0,
    order_count: 0,
    revenue_total: 0,
    pending_order_count: 0,
    low_stock_count: 0,
    lowest_inventory: null,
  };

  const recentOrders = await db
    .prepare(
      `
        select
          o.display_id,
          o.created_at,
          o.total_amount as total,
          o.currency_code,
          trim(coalesce(c.first_name, '') || ' ' || coalesce(c.last_name, '')) as customer_name,
          coalesce(c.email, o.email) as email,
          coalesce(group_concat(distinct oi.title), 'No items') as product_summary,
          coalesce(o.payment_status, o.fulfillment_status, o.status) as status
        from orders o
        left join customers c on c.id = o.customer_id
        left join order_items oi on oi.order_id = o.id
        group by o.id
        order by o.created_at desc
        limit 5
      `,
    )
    .all<{
    display_id: number | null;
    created_at: string;
    total: number;
    currency_code: string;
    customer_name: string | null;
    email: string | null;
    status: string | null;
    product_summary: string | null;
  }>();

  const revenueRows = await db
    .prepare("select total_amount, currency_code from orders")
    .all<{ total_amount: number; currency_code: string }>();
  const revenueTotal = revenueRows.reduce(
    (sum, order) =>
      sum + convertAmount(order.total_amount, order.currency_code, "usd"),
    0,
  );

  const notifications = [];
  const pendingOrders = snapshot.pending_order_count ?? 0;
  const lowStockCount = snapshot.low_stock_count ?? 0;
  const lowestInventory = snapshot.lowest_inventory ?? 0;

  if (pendingOrders > 0) {
    notifications.push({
      id: "pending-orders",
      title: `${pendingOrders} order${pendingOrders === 1 ? "" : "s"} need attention`,
      body: "Review payment or fulfillment status before customers wait too long.",
      href: "/admin/orders",
      action: "View orders",
      tone: "yellow",
    });
  }

  if (lowStockCount > 0) {
    notifications.push({
      id: "low-stock",
      title: `${lowStockCount} product${lowStockCount === 1 ? "" : "s"} low on stock`,
      body: `Lowest available inventory is ${lowestInventory}. Update stock or hide sold-out items.`,
      href: "/admin/products",
      action: "Manage inventory",
      tone: "red",
    });
  }

  if (notifications.length === 0) {
    notifications.push({
      id: "all-clear",
      title: "No urgent admin alerts",
      body: "Orders and inventory look steady right now.",
      href: "/admin",
      action: "Refresh dashboard",
      tone: "green",
    });
  }

  return {
    stats: [
      { label: "Revenue", value: formatAmount(revenueTotal, "usd") },
      { label: "Orders", value: String(snapshot.order_count ?? 0) },
      { label: "Products", value: String(snapshot.product_count ?? 0) },
      { label: "Customers", value: String(snapshot.customer_count ?? 0) },
    ],
    recentOrders: recentOrders.map((order) => ({
      id: order.display_id ? `#${order.display_id}` : "Draft",
      customer: order.customer_name || order.email || "Guest",
      date: formatAdminDate(order.created_at),
      total: formatAmount(order.total, order.currency_code),
      status: order.status || "pending",
      statusTone: toStatusTone(order.status),
      productSummary: order.product_summary || "No items",
    })),
    notifications,
  };
}

export async function getAdminOrders(query?: string) {
  await assertAdminAuthenticated();

  const searchTerm = query?.trim();
  const db = await getDb();
  const rows = await db
    .prepare(
      `
        select
          o.id as order_id,
          o.display_id,
          o.created_at,
          o.total_amount as total,
          o.currency_code,
          trim(coalesce(c.first_name, '') || ' ' || coalesce(c.last_name, '')) as customer_name,
          coalesce(c.email, o.email) as email,
          o.status,
          o.payment_status,
          coalesce(group_concat(distinct oi.title), 'No items') as product_summary
        from orders o
        left join customers c on c.id = o.customer_id
        left join order_items oi on oi.order_id = o.id
        where @query is null
          or cast(o.display_id as text) like @query
          or o.id like @query
          or coalesce(c.email, o.email, '') like @query
          or coalesce(c.first_name, '') like @query
          or coalesce(c.last_name, '') like @query
          or coalesce(oi.title, '') like @query
        group by o.id
        order by o.created_at desc
      `,
    )
    .all<{
    order_id: string;
    display_id: number | null;
    created_at: string;
    total: number;
    currency_code: string;
    customer_name: string | null;
    email: string | null;
    status: string | null;
    payment_status: string | null;
    product_summary: string | null;
  }>({ query: searchTerm ? `%${searchTerm}%` : null });

  return rows.map((order) => ({
    orderId: order.order_id,
    id: order.display_id ? `#${order.display_id}` : "Draft",
    customer: order.customer_name || order.email || "Guest",
    date: formatAdminDate(order.created_at),
    total: formatAmount(order.total, order.currency_code),
    status: order.status || "pending",
    statusTone: toStatusTone(order.status),
    productSummary: order.product_summary || "No items",
    paymentStatus: order.payment_status || "not_paid",
    paymentStatusTone:
      order.payment_status === "captured" || order.payment_status === "paid"
        ? "bg-green-100 text-green-700"
        : "bg-gray-100 text-gray-600",
  }));
}

export async function getAdminOrderDetails(orderId: string) {
  await assertAdminAuthenticated();

  const db = await getDb();
  const rows = await db
    .prepare(
      `
        select
          o.id as order_id,
          o.display_id,
          o.created_at,
          o.email,
          o.status,
          o.payment_status,
          o.currency_code,
          trim(coalesce(c.first_name, '') || ' ' || coalesce(c.last_name, '')) as customer_name,
          c.phone as customer_phone,
          a.first_name as shipping_first_name,
          a.last_name as shipping_last_name,
          a.address_1,
          a.address_2,
          a.city,
          a.province,
          a.postal_code,
          a.phone,
          oi.id as item_id,
          oi.title as item_title,
          oi.description as item_description,
          oi.quantity,
          oi.unit_price,
          oi.thumbnail,
          oi.variant_id
        from orders o
        left join customers c on c.id = o.customer_id
        left join addresses a on a.id = o.shipping_address_id
        left join order_items oi on oi.order_id = o.id
        where o.id = ?
        order by oi.created_at asc
      `,
    )
    .all<{
    order_id: string;
    display_id: number | null;
    created_at: string;
    email: string;
    status: string | null;
    payment_status: string | null;
    currency_code: string;
    customer_name: string | null;
    customer_phone: string | null;
    shipping_first_name: string | null;
    shipping_last_name: string | null;
    address_1: string | null;
    address_2: string | null;
    city: string | null;
    province: string | null;
    postal_code: string | null;
    phone: string | null;
    item_id: string | null;
    item_title: string | null;
    item_description: string | null;
    quantity: number | null;
    unit_price: number | null;
    thumbnail: string | null;
    variant_id: string | null;
  }>([orderId]);

  const firstRow = rows[0];
  if (!firstRow) {
    return null;
  }

  const items = rows
    .filter((row) => row.item_id)
    .map((row) => ({
      id: row.item_id!,
      title: row.item_title || "Untitled Item",
      description: row.item_description || "Default variant",
      quantity: row.quantity ?? 0,
      unitPrice: formatAmount(row.unit_price ?? 0, firstRow.currency_code),
      lineTotal: formatAmount((row.unit_price ?? 0) * (row.quantity ?? 0), firstRow.currency_code),
      thumbnail: row.thumbnail,
      variantId: row.variant_id,
    }));

  const shippingName =
    `${firstRow.shipping_first_name || ""} ${firstRow.shipping_last_name || ""}`.trim() ||
    firstRow.customer_name ||
    "Guest";
  const total = rows.reduce(
    (sum, row) => sum + (row.unit_price ?? 0) * (row.quantity ?? 0),
    0,
  );

  return {
    orderId: firstRow.order_id,
    displayId: firstRow.display_id ? `#${firstRow.display_id}` : "Draft",
    date: formatAdminDate(firstRow.created_at),
    status: firstRow.status || "pending",
    statusTone: toStatusTone(firstRow.status),
    paymentStatus: firstRow.payment_status || "not_paid",
    paymentStatusTone:
      firstRow.payment_status === "captured" || firstRow.payment_status === "paid"
        ? "bg-green-100 text-green-700"
        : "bg-gray-100 text-gray-600",
    customer: {
      name: firstRow.customer_name || shippingName,
      email: firstRow.email,
      phone: firstRow.customer_phone || firstRow.phone || "N/A",
    },
    delivery: {
      name: shippingName,
      address1: firstRow.address_1 || "N/A",
      address2: firstRow.address_2 || "",
      city: firstRow.city || "N/A",
      province: firstRow.province || "",
      postalCode: firstRow.postal_code || "",
      phone: firstRow.phone || firstRow.customer_phone || "N/A",
    },
    items,
    total: formatAmount(total, firstRow.currency_code),
  };
}

export async function completeAdminOrder(orderId: string) {
  await assertAdminAuthenticated();

  const normalizedId = orderId.trim();
  if (!normalizedId) {
    throw new Error("Order id is required.");
  }

  const db = await getDb();
  const existingOrder = await db
    .prepare("select id, status from orders where id = ? limit 1")
    .get<{ id: string; status: string | null }>([normalizedId]);

  if (!existingOrder) {
    throw new Error("Order was not found.");
  }

  if (existingOrder.status === "completed") {
    return "already_completed" as const;
  }

  await db.prepare(
    `
      update orders
      set status = 'completed',
          fulfillment_status = 'fulfilled',
          payment_status = 'captured',
          updated_at = datetime('now')
      where id = ?
    `,
  ).run([normalizedId]);

  return "updated" as const;
}

export async function toggleAdminOrderPaymentStatus(orderId: string) {
  await assertAdminAuthenticated();

  const normalizedId = orderId.trim();
  if (!normalizedId) {
    throw new Error("Order id is required.");
  }

  const db = await getDb();
  const existingOrder = await db
    .prepare("select id, payment_status from orders where id = ? limit 1")
    .get<{ id: string; payment_status: string | null }>([normalizedId]);

  if (!existingOrder) {
    throw new Error("Order was not found.");
  }

  const nextPaymentStatus =
    existingOrder.payment_status === "captured" || existingOrder.payment_status === "paid"
      ? "awaiting"
      : "captured";

  await db
    .prepare("update orders set payment_status = ?, updated_at = datetime('now') where id = ?")
    .run([nextPaymentStatus, normalizedId]);

  return nextPaymentStatus;
}

export async function getAdminCustomers() {
  await assertAdminAuthenticated();

  const db = await getDb();
  const currencyCode = await getSetting("default_currency_code", "usd");
  const customers = await db
    .prepare(
      `
        select
          c.id,
          c.email,
          c.first_name,
          c.last_name,
          c.phone,
          c.metadata_json,
          c.created_at,
          count(distinct o.id) as orders,
          coalesce(sum(o.total_amount), 0) as spent
        from customers c
        left join orders o on o.customer_id = c.id
        where c.deleted_at is null
        group by c.id
        order by c.created_at desc
      `,
    )
    .all<{
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    metadata_json: string | null;
    created_at: string;
    orders: number;
    spent: number;
  }>();

  const orderHistory = db.prepare(
    `
      select id as order_id, display_id, created_at, total_amount as total, status
      from orders
      where customer_id = ?
      order by created_at desc
      limit 3
    `,
  );

  return Promise.all(customers.map(async (customer) => {
    const metadata = parseJsonObject(customer.metadata_json);
    const name =
      `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
      customer.email;
    const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
    const latestCheckout =
      typeof metadata?.latest_checkout === "object" && metadata.latest_checkout
        ? (metadata.latest_checkout as { submitted_at?: unknown })
        : null;

    return {
      id: customer.id,
      name,
      email: customer.email,
      phone: customer.phone,
      orders: customer.orders,
      checkoutSubmissions:
        typeof metadata?.checkout_submissions === "number"
          ? metadata.checkout_submissions
          : 0,
      lastCheckout:
        typeof latestCheckout?.submitted_at === "string"
          ? formatAdminDate(latestCheckout.submitted_at)
          : "N/A",
      spent: formatAmount(customer.spent, currencyCode),
      initials: initials || customer.email.slice(0, 2).toUpperCase(),
      purchaseHistory: (
        await orderHistory.all<{
          order_id: string;
          display_id: number | null;
          created_at: string;
          total: number;
          status: string | null;
        }>([customer.id])
      ).map((order) => ({
        orderId: order.order_id,
        displayId: order.display_id ? `#${order.display_id}` : "Draft",
        date: formatAdminDate(order.created_at),
        total: formatAmount(order.total, currencyCode),
        status: order.status || "pending",
        statusTone: toStatusTone(order.status),
      })),
    };
  }));
}

export async function getAdminProducts() {
  await assertAdminAuthenticated();

  const db = await getDb();
  const rows = await db
    .prepare(
      `
        select
          p.id,
          p.title,
          p.description,
          p.handle,
          p.status,
          p.thumbnail,
          p.grading_data,
          p.battery_health,
          p.is_certified_pre_owned,
          p.metadata_json,
          p.brand_name,
          p.model_name,
          p.color,
          p.storage,
          p.imei,
          coalesce(sum(pv.inventory_quantity), 0) as inventory,
          coalesce(max(pv.price_amount), 0) as price,
          coalesce(max(pv.currency_code), 'usd') as currency_code
        from products p
        left join product_variants pv on pv.product_id = p.id and pv.deleted_at is null
        where p.deleted_at is null
        group by p.id
        order by p.created_at desc, p.rowid desc
      `,
    )
    .all<{
    id: string;
    title: string;
    description: string | null;
    handle: string;
    status: string;
    thumbnail: string | null;
    grading_data: string | null;
    battery_health: number | null;
    is_certified_pre_owned: number;
    metadata_json: string | null;
    brand_name: string | null;
    model_name: string | null;
    color: string | null;
    storage: string | null;
    imei: string | null;
    inventory: number;
    price: number;
    currency_code: string;
  }>();

  return rows.map((row) => {
    const metadata = parseJsonObject(row.metadata_json);
    const facts = getEditableProductFacts(metadata);

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      handle: row.handle,
      status: row.status,
      thumbnail: row.thumbnail,
      inventory: row.inventory,
      price: row.price,
      currencyCode: row.currency_code || "usd",
      metadata,
      brandName:
        row.brand_name ||
        (typeof metadata?.brand_name === "string" ? metadata.brand_name : "") ||
        row.title.split(/\s+/).slice(0, 1).join(""),
      modelName:
        row.model_name ||
        (typeof metadata?.model_name === "string" ? metadata.model_name : "") ||
        row.title.split(/\s+/).slice(1).join(" "),
      color: row.color || facts.color || "",
      storage: row.storage || facts.storage || "",
      imei: row.imei || facts.imei || "",
      gradingData: row.grading_data || "",
      batteryHealth: row.battery_health ?? "",
      isCertifiedPreOwned: Boolean(row.is_certified_pre_owned),
      referenceUrl:
        sanitizeHttpUrl(
          typeof metadata?.reference_url === "string" ? metadata.reference_url : "",
        ) || "",
    };
  });
}

type CreateAdminProductInput = {
  brandName: string;
  modelName: string;
  title: string;
  handle?: string;
  description?: string;
  thumbnail?: string;
  inventory: number;
  price: number;
  currencyCode: string;
  status?: "draft" | "published" | "proposed" | "rejected";
  color?: string;
  storage?: string;
  imei?: string;
  gradingData?: string;
  batteryHealth?: number | null;
  isCertifiedPreOwned?: boolean;
  referenceUrl?: string;
};

export async function createAdminProduct(input: CreateAdminProductInput) {
  await assertAdminAuthenticated();

  const title = input.title.trim();
  const description = input.description?.trim() || null;
  const thumbnail = input.thumbnail?.trim() || null;
  const gradingData = input.gradingData?.trim() || null;
  const batteryHealth =
    typeof input.batteryHealth === "number" ? input.batteryHealth : null;

  if (!title) throw new Error("Product title is required.");
  if (!Number.isFinite(input.inventory) || input.inventory < 0) {
    throw new Error("Inventory must be zero or greater.");
  }
  if (!Number.isFinite(input.price) || input.price < 0) {
    throw new Error("Price must be zero or greater.");
  }
  const currencyCode = normalizeCurrencyCode(input.currencyCode);
  if (
    batteryHealth !== null &&
    (!Number.isFinite(batteryHealth) || batteryHealth < 0 || batteryHealth > 100)
  ) {
    throw new Error("Battery health must be between 0 and 100.");
  }

  const referenceUrl = sanitizeHttpUrl(input.referenceUrl);
  const [referenceSpecs, referenceSpecSections] = await Promise.all([
    fetchReferenceSpecs(referenceUrl),
    fetchReferenceSpecSections(referenceUrl),
  ]);

  const db = await getDb();
  return db.transaction(async (transactionDb) => {
    const handle = await getUniqueProductHandle(transactionDb, input.handle || title);
    const status = input.status || "published";
    const metadata = buildProductMetadata(undefined, {
      title,
      handle,
      brandName: input.brandName,
      modelName: input.modelName,
      color: input.color,
      storage: input.storage,
      imei: input.imei,
      referenceUrl,
      referenceSpecs,
      referenceSpecSections,
    });
    const productId = createEntityId("prod");
    const variantId = createEntityId("variant");

    await transactionDb.prepare(
      `
        insert into products (
          id, title, description, handle, thumbnail, battery_health, grading_data,
          metadata_json, status, brand_name, model_name, color, storage, imei,
          is_certified_pre_owned, created_at, updated_at
        )
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `,
    ).run([
      productId,
      title,
      description,
      handle,
      thumbnail,
      batteryHealth,
      gradingData,
      stringifyJson(metadata),
      status,
      input.brandName?.trim() || null,
      input.modelName?.trim() || null,
      input.color?.trim() || null,
      input.storage?.trim() || null,
      input.imei?.trim() || null,
      input.isCertifiedPreOwned === false ? 0 : 1,
    ]);

    await transactionDb.prepare(
      `
        insert into product_variants (
          id, product_id, title, inventory_quantity, price_amount,
          currency_code, created_at, updated_at
        )
        values (?, ?, 'Default', ?, ?, ?, datetime('now'), datetime('now'))
      `,
    ).run([variantId, productId, input.inventory, input.price, currencyCode]);

    return productId;
  });
}

export async function removeAdminProduct(productId: string) {
  await assertAdminAuthenticated();

  const normalizedId = productId.trim();
  if (!normalizedId) {
    throw new Error("Product id is required.");
  }

  const db = await getDb();
  return db.transaction(async (transactionDb) => {
    await transactionDb.prepare(
      "update product_variants set deleted_at = datetime('now'), updated_at = datetime('now') where product_id = ? and deleted_at is null",
    ).run([normalizedId]);

    const result = await transactionDb.prepare(
      "update products set deleted_at = datetime('now'), updated_at = datetime('now') where id = ? and deleted_at is null",
    ).run([normalizedId]);

    return result.changes > 0;
  });
}

type UpdateAdminProductInput = CreateAdminProductInput & {
  productId: string;
  handle: string;
  status: "draft" | "published" | "proposed" | "rejected";
};

export async function updateAdminProduct(input: UpdateAdminProductInput) {
  await assertAdminAuthenticated();

  const productId = input.productId.trim();
  const title = input.title.trim();
  const description = input.description?.trim() || null;
  const thumbnail = input.thumbnail?.trim() || null;
  const gradingData = input.gradingData?.trim() || null;
  const batteryHealth =
    typeof input.batteryHealth === "number" ? input.batteryHealth : null;

  if (!productId) throw new Error("Product id is required.");
  if (!title) throw new Error("Product title is required.");
  if (!Number.isFinite(input.inventory) || input.inventory < 0) {
    throw new Error("Inventory must be zero or greater.");
  }
  if (!Number.isFinite(input.price) || input.price < 0) {
    throw new Error("Price must be zero or greater.");
  }
  const currencyCode = normalizeCurrencyCode(input.currencyCode);
  if (
    batteryHealth !== null &&
    (!Number.isFinite(batteryHealth) || batteryHealth < 0 || batteryHealth > 100)
  ) {
    throw new Error("Battery health must be between 0 and 100.");
  }

  const referenceUrl = sanitizeHttpUrl(input.referenceUrl);
  const [referenceSpecs, referenceSpecSections] = await Promise.all([
    fetchReferenceSpecs(referenceUrl),
    fetchReferenceSpecSections(referenceUrl),
  ]);

  const db = await getDb();
  return db.transaction(async (transactionDb) => {
    const existingProduct = await transactionDb
      .prepare("select id, metadata_json from products where id = ? and deleted_at is null limit 1")
      .get<{ id: string; metadata_json: string | null }>([productId]);

    if (!existingProduct) {
      throw new Error("Product was not found.");
    }

    const handle = await getUniqueProductHandle(transactionDb, input.handle, productId);
    const metadata = buildProductMetadata(
      parseJsonObject(existingProduct.metadata_json) || undefined,
      {
        title,
        handle,
        brandName: input.brandName,
        modelName: input.modelName,
        color: input.color,
        storage: input.storage,
        imei: input.imei,
        referenceUrl,
        referenceSpecs,
        referenceSpecSections,
      },
    );

    await transactionDb.prepare(
      `
        update products
        set title = ?,
            description = ?,
            handle = ?,
            thumbnail = ?,
            battery_health = ?,
            grading_data = ?,
            metadata_json = ?,
            status = ?,
            brand_name = ?,
            model_name = ?,
            color = ?,
            storage = ?,
            imei = ?,
            is_certified_pre_owned = ?,
            updated_at = datetime('now')
        where id = ?
      `,
    ).run([
      title,
      description,
      handle,
      thumbnail,
      batteryHealth,
      gradingData,
      stringifyJson(metadata),
      input.status,
      input.brandName?.trim() || null,
      input.modelName?.trim() || null,
      input.color?.trim() || null,
      input.storage?.trim() || null,
      input.imei?.trim() || null,
      input.isCertifiedPreOwned === false ? 0 : 1,
      productId,
    ]);

    await transactionDb.prepare(
      "update product_variants set inventory_quantity = ?, price_amount = ?, currency_code = ?, updated_at = datetime('now') where product_id = ? and deleted_at is null",
    ).run([input.inventory, input.price, currencyCode, productId]);

    return true;
  });
}

export async function incrementAdminProductInventory(productId: string, amount: number) {
  await assertAdminAuthenticated();

  const normalizedId = productId.trim();
  const normalizedAmount = Math.trunc(amount);

  if (!normalizedId) throw new Error("Product id is required.");
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new Error("Inventory increase must be greater than zero.");
  }

  const db = await getDb();
  const result = await db
    .prepare(
      `
        update product_variants
        set inventory_quantity = inventory_quantity + ?,
            updated_at = datetime('now')
        where product_id = ?
          and deleted_at is null
      `,
    )
    .run([normalizedAmount, normalizedId]);

  return result.changes > 0;
}

export async function getAdminSettingsData() {
  await assertAdminAuthenticated();

  const db = await getDb();
  const salesChannels = await db
    .prepare(
      "select id, name, description, is_disabled from sales_channels order by created_at asc",
    )
    .all<{
    id: string;
    name: string;
    description: string | null;
    is_disabled: number;
  }>();
  const productCountRow = await db
    .prepare("select count(*) as count from products where deleted_at is null")
    .get<{ count: number }>();
  const productCount = productCountRow?.count ?? 0;

  return {
    store: {
      name: await getSetting("store_name", "Aman Mobile"),
      default_currency_code: await getSetting("default_currency_code", "usd"),
      default_sales_channel_id: null,
    },
    salesChannels: salesChannels.map((channel) => ({
      ...channel,
      is_disabled: Boolean(channel.is_disabled),
    })),
    productCount,
  };
}
