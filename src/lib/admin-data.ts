import "server-only";

import { randomUUID } from "crypto";

import {
  buildProductMetadata,
  fetchReferenceSpecSections,
  fetchReferenceSpecs,
  getEditableProductFacts,
  sanitizeHttpUrl,
} from "@/lib/product-specs";
import { formatAmount } from "@/lib/utils";

const { Client } = require("pg");

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://postgres:12345678@127.0.0.1:5434/medusa_db";

type PgClient = {
  connect: () => Promise<void>;
  end: () => Promise<void>;
  query: <T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows: T[] }>;
};

function createClient(): PgClient {
  return new Client({ connectionString: DATABASE_URL });
}

async function withClient<T>(callback: (client: PgClient) => Promise<T>) {
  const client = createClient();
  await client.connect();

  try {
    return await callback(client);
  } finally {
    await client.end();
  }
}

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

async function getUniqueProductHandle(
  client: PgClient,
  rawHandle: string,
  excludeProductId?: string,
) {
  const baseHandle = slugifyHandle(rawHandle) || `product-${Date.now()}`;
  let candidate = baseHandle;
  let suffix = 2;

  while (true) {
    const params: unknown[] = [candidate];
    const excludeClause = excludeProductId ? "and id <> $2" : "";

    if (excludeProductId) {
      params.push(excludeProductId);
    }

    const { rows } = await client.query<{ exists: boolean }>(
      `
        select exists(
          select 1
          from product
          where handle = $1
            and deleted_at is null
            ${excludeClause}
        ) as exists
      `,
      params,
    );

    if (!rows[0]?.exists) {
      return candidate;
    }

    candidate = `${baseHandle}-${suffix}`;
    suffix += 1;
  }
}

export async function getAdminDashboardData() {
  return withClient(async (client) => {
    const productCount = await client.query<{ count: number }>(
      'select count(*)::int as count from "product"',
    );
    const customerCount = await client.query<{ count: number }>(
      'select count(*)::int as count from "customer"',
    );
    const orderCount = await client.query<{ count: number }>(
      'select count(*)::int as count from "order"',
    );
    const revenueTotal = await client.query<{ total: number }>(`
        select coalesce(sum(li.unit_price * li.quantity), 0)::int as total
        from "order" o
        left join line_item li on li.order_id = o.id
      `);
    const recentOrders = await client.query<{
      display_id: number | null;
      created_at: string;
      total: number;
      customer_name: string | null;
      email: string | null;
      status: string | null;
    }>(`
      select
        o.display_id,
        o.created_at,
        coalesce(sum(li.unit_price * li.quantity), 0)::int as total,
        nullif(trim(concat(coalesce(c.first_name, ''), ' ', coalesce(c.last_name, ''))), '') as customer_name,
        coalesce(c.email, o.email) as email,
        coalesce(
          o.payment_status::text,
          o.fulfillment_status::text,
          o.status::text
        ) as status
      from "order" o
      left join customer c on c.id = o.customer_id
      left join line_item li on li.order_id = o.id
      group by o.id, c.id
      order by o.created_at desc
      limit 5
    `);

    return {
      stats: [
        {
          label: "Revenue",
          value: formatAmount(revenueTotal.rows[0]?.total ?? 0, "USD"),
        },
        {
          label: "Orders",
          value: String(orderCount.rows[0]?.count ?? 0),
        },
        {
          label: "Products",
          value: String(productCount.rows[0]?.count ?? 0),
        },
        {
          label: "Customers",
          value: String(customerCount.rows[0]?.count ?? 0),
        },
      ],
      recentOrders: recentOrders.rows.map((order) => ({
        id: order.display_id ? `#${order.display_id}` : "Draft",
        customer: order.customer_name || order.email || "Guest",
        date: formatAdminDate(order.created_at),
        total: formatAmount(order.total, "USD"),
        status: order.status || "pending",
        statusTone: toStatusTone(order.status),
      })),
    };
  });
}

export async function getAdminOrders(query?: string) {
  return withClient(async (client) => {
    const searchTerm = query?.trim();
    const params: unknown[] = [];
    let whereClause = "";

    if (searchTerm) {
      params.push(`%${searchTerm}%`);
      whereClause = `
        where
          cast(o.display_id as text) ilike $1
          or coalesce(c.email, o.email, '') ilike $1
          or coalesce(c.first_name, '') ilike $1
          or coalesce(c.last_name, '') ilike $1
      `;
    }

    const { rows } = await client.query<{
      order_id: string;
      display_id: number | null;
      created_at: string;
      total: number;
      customer_name: string | null;
      email: string | null;
      status: string | null;
    }>(
      `
        select
          o.id as order_id,
          o.display_id,
          o.created_at,
          coalesce(sum(li.unit_price * li.quantity), 0)::int as total,
          nullif(trim(concat(coalesce(c.first_name, ''), ' ', coalesce(c.last_name, ''))), '') as customer_name,
          coalesce(c.email, o.email) as email,
          coalesce(
            o.payment_status::text,
            o.fulfillment_status::text,
            o.status::text
          ) as status
        from "order" o
        left join customer c on c.id = o.customer_id
        left join line_item li on li.order_id = o.id
        ${whereClause}
        group by o.id, c.id
        order by o.created_at desc
      `,
      params,
    );

    return rows.map((order) => ({
      orderId: order.order_id,
      id: order.display_id ? `#${order.display_id}` : "Draft",
      customer: order.customer_name || order.email || "Guest",
      date: formatAdminDate(order.created_at),
      total: formatAmount(order.total, "USD"),
      status: order.status || "pending",
      statusTone: toStatusTone(order.status),
    }));
  });
}

export async function getAdminOrderDetails(orderId: string) {
  return withClient(async (client) => {
    const orderRows = await client.query<{
      order_id: string;
      display_id: number | null;
      created_at: string;
      email: string;
      status: string | null;
      customer_name: string | null;
      customer_phone: string | null;
      shipping_first_name: string | null;
      shipping_last_name: string | null;
      address_1: string | null;
      address_2: string | null;
      city: string | null;
      province: string | null;
      postal_code: string | null;
      country_code: string | null;
      phone: string | null;
      item_id: string | null;
      item_title: string | null;
      item_description: string | null;
      quantity: number | null;
      unit_price: number | null;
      thumbnail: string | null;
      variant_id: string | null;
    }>(
      `
        select
          o.id as order_id,
          o.display_id,
          o.created_at,
          o.email,
          coalesce(
            o.payment_status::text,
            o.fulfillment_status::text,
            o.status::text
          ) as status,
          nullif(trim(concat(coalesce(c.first_name, ''), ' ', coalesce(c.last_name, ''))), '') as customer_name,
          c.phone as customer_phone,
          a.first_name as shipping_first_name,
          a.last_name as shipping_last_name,
          a.address_1,
          a.address_2,
          a.city,
          a.province,
          a.postal_code,
          a.country_code,
          a.phone,
          li.id as item_id,
          li.title as item_title,
          li.description as item_description,
          li.quantity,
          li.unit_price,
          li.thumbnail,
          li.variant_id
        from "order" o
        left join customer c on c.id = o.customer_id
        left join address a on a.id = o.shipping_address_id
        left join line_item li on li.order_id = o.id
        where o.id = $1
        order by li.created_at asc nulls last
      `,
      [orderId],
    );

    const firstRow = orderRows.rows[0];

    if (!firstRow) {
      return null;
    }

    const items = orderRows.rows
      .filter((row) => row.item_id)
      .map((row) => ({
        id: row.item_id!,
        title: row.item_title || "Untitled Item",
        description: row.item_description || "Default variant",
        quantity: row.quantity ?? 0,
        unitPrice: formatAmount(row.unit_price ?? 0, "USD"),
        lineTotal: formatAmount(
          (row.unit_price ?? 0) * (row.quantity ?? 0),
          "USD",
        ),
        thumbnail: row.thumbnail,
        variantId: row.variant_id,
      }));

    const shippingName =
      `${firstRow.shipping_first_name || ""} ${firstRow.shipping_last_name || ""}`.trim() ||
      firstRow.customer_name ||
      "Guest";

    const orderTotal = items.reduce((sum, item) => {
      const amount = Number(item.lineTotal.replace(/[^0-9.-]+/g, ""));
      return Number.isFinite(amount) ? sum + amount : sum;
    }, 0);

    return {
      orderId: firstRow.order_id,
      displayId: firstRow.display_id ? `#${firstRow.display_id}` : "Draft",
      date: formatAdminDate(firstRow.created_at),
      status: firstRow.status || "pending",
      statusTone: toStatusTone(firstRow.status),
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
        countryCode: (firstRow.country_code || "N/A").toUpperCase(),
        phone: firstRow.phone || firstRow.customer_phone || "N/A",
      },
      items,
      total: formatAmount(
        items.reduce((sum, item) => {
          const raw = Number(item.lineTotal.replace(/[^0-9.-]+/g, ""));
          return Number.isFinite(raw) ? sum + raw * 100 : sum;
        }, 0),
        "USD",
      ),
    };
  });
}

export async function completeAdminOrder(orderId: string) {
  return withClient(async (client) => {
    const normalizedId = orderId.trim();

    if (!normalizedId) {
      throw new Error("Order id is required.");
    }

    const { rows } = await client.query<{ id: string }>(
      `
        update "order"
        set
          status = 'completed',
          fulfillment_status = 'fulfilled',
          payment_status = 'captured',
          updated_at = now()
        where id = $1
          and status <> 'completed'
        returning id
      `,
      [normalizedId],
    );

    return Boolean(rows[0]?.id);
  });
}

export async function getAdminCustomers() {
  return withClient(async (client) => {
    const { rows } = await client.query<{
      id: string;
      email: string;
      first_name: string | null;
      last_name: string | null;
      phone: string | null;
      metadata: Record<string, unknown> | null;
      orders: number;
      spent: number;
    }>(`
      select
        c.id,
        c.email,
        c.first_name,
        c.last_name,
        c.phone,
        c.metadata,
        count(distinct o.id)::int as orders,
        coalesce(sum(li.unit_price * li.quantity), 0)::int as spent
      from customer c
      left join "order" o on o.customer_id = c.id
      left join line_item li on li.order_id = o.id
      group by c.id
      order by c.created_at desc
    `);

    return rows.map((customer) => {
      const name =
        `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
        customer.email;
      const initials = name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("");

      return {
        id: customer.id,
        name,
        email: customer.email,
        phone: customer.phone,
        orders: customer.orders,
        checkoutSubmissions:
          typeof customer.metadata?.checkout_submissions === "number"
            ? customer.metadata.checkout_submissions
            : 0,
        lastCheckout:
          typeof customer.metadata?.latest_checkout === "object" &&
          customer.metadata?.latest_checkout &&
          typeof (
            customer.metadata.latest_checkout as { submitted_at?: unknown }
          ).submitted_at === "string"
            ? formatAdminDate(
                (
                  customer.metadata.latest_checkout as {
                    submitted_at: string;
                  }
                ).submitted_at,
              )
            : "N/A",
        spent: formatAmount(customer.spent, "USD"),
        initials: initials || customer.email.slice(0, 2).toUpperCase(),
      };
    });
  });
}

export async function getAdminProducts() {
  return withClient(async (client) => {
    const { rows } = await client.query<{
      id: string;
      title: string;
      description: string | null;
      handle: string;
      status: string;
      thumbnail: string | null;
      grading_data: string | null;
      battery_health: number | null;
      metadata: Record<string, unknown> | null;
      inventory: number;
      price: number;
    }>(`
      select
        p.id,
        p.title,
        p.description,
        p.handle,
        p.status,
        p.thumbnail,
        p.grading_data,
        p.battery_health,
        p.metadata,
        coalesce((
          select sum(pv2.inventory_quantity)::int
          from product_variant pv2
          where pv2.product_id = p.id
            and pv2.deleted_at is null
        ), 0) as inventory,
        coalesce((
          select max(ma2.amount)::int
          from product_variant pv2
          join product_variant_money_amount pvma2
            on pvma2.variant_id = pv2.id
            and pvma2.deleted_at is null
          join money_amount ma2
            on ma2.id = pvma2.money_amount_id
            and ma2.deleted_at is null
          where pv2.product_id = p.id
            and pv2.deleted_at is null
        ), 0) as price
      from product p
      where p.deleted_at is null
      order by p.created_at desc
    `);

    return rows.map((row) => {
      const facts = getEditableProductFacts(row.metadata || undefined);

      return {
        ...row,
        brandName:
          typeof row.metadata?.brand_name === "string"
            ? row.metadata.brand_name
            : row.title.split(/\s+/).slice(0, 1).join(""),
        modelName:
          typeof row.metadata?.model_name === "string"
            ? row.metadata.model_name
            : row.title.split(/\s+/).slice(1).join(" "),
        color: facts.color || "",
        storage: facts.storage || "",
        imei: facts.imei || "",
        gradingData: row.grading_data || "",
        batteryHealth: row.battery_health ?? "",
        referenceUrl: sanitizeHttpUrl(
          typeof row.metadata?.reference_url === "string"
            ? row.metadata.reference_url
            : "",
        ) || "",
      };
    });
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
  status?: "draft" | "published" | "proposed" | "rejected";
  color?: string;
  storage?: string;
  imei?: string;
  gradingData?: string;
  batteryHealth?: number | null;
  referenceUrl?: string;
};

export async function createAdminProduct(input: CreateAdminProductInput) {
  return withClient(async (client) => {
    const title = input.title.trim();
    const description = input.description?.trim() || null;
    const thumbnail = input.thumbnail?.trim() || null;
    const gradingData = input.gradingData?.trim() || null;
    const batteryHealth =
      typeof input.batteryHealth === "number" ? input.batteryHealth : null;

    if (!title) {
      throw new Error("Product title is required.");
    }

    if (!Number.isFinite(input.inventory) || input.inventory < 0) {
      throw new Error("Inventory must be zero or greater.");
    }

    if (!Number.isFinite(input.price) || input.price < 0) {
      throw new Error("Price must be zero or greater.");
    }

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

    await client.query("begin");

    try {
      const handle = await getUniqueProductHandle(client, input.handle || title);
      const currencyResult = await client.query<{ default_currency_code: string | null }>(
        "select default_currency_code from store limit 1",
      );
      const currencyCode =
        currencyResult.rows[0]?.default_currency_code?.toLowerCase() || "usd";
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
      const moneyAmountId = createEntityId("ma");
      const variantAmountLinkId = createEntityId("pvma");

      await client.query(
        `
          insert into product (
            id,
            title,
            description,
            handle,
            thumbnail,
            battery_health,
            grading_data,
            metadata,
            status,
            created_at,
            updated_at
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())
        `,
        [
          productId,
          title,
          description,
          handle,
          thumbnail,
          batteryHealth,
          gradingData,
          metadata,
          status,
        ],
      );

      await client.query(
        `
          insert into product_variant (
            id,
            title,
            product_id,
            inventory_quantity,
            created_at,
            updated_at
          )
          values ($1, $2, $3, $4, now(), now())
        `,
        [variantId, "Default", productId, input.inventory],
      );

      await client.query(
        `
          insert into money_amount (
            id,
            currency_code,
            amount,
            created_at,
            updated_at
          )
          values ($1, $2, $3, now(), now())
        `,
        [moneyAmountId, currencyCode, input.price],
      );

      await client.query(
        `
          insert into product_variant_money_amount (
            id,
            money_amount_id,
            variant_id,
            created_at,
            updated_at
          )
          values ($1, $2, $3, now(), now())
        `,
        [variantAmountLinkId, moneyAmountId, variantId],
      );

      await client.query("commit");

      return productId;
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}

export async function removeAdminProduct(productId: string) {
  return withClient(async (client) => {
    const normalizedId = productId.trim();

    if (!normalizedId) {
      throw new Error("Product id is required.");
    }

    await client.query("begin");

    try {
      await client.query(
        `
          update product_option_value
          set deleted_at = now(), updated_at = now()
          where deleted_at is null
            and variant_id in (
              select id
              from product_variant
              where product_id = $1
            )
        `,
        [normalizedId],
      );

      await client.query(
        `
          update product_option
          set deleted_at = now(), updated_at = now()
          where product_id = $1
            and deleted_at is null
        `,
        [normalizedId],
      );

      await client.query(
        `
          update product_variant_money_amount
          set deleted_at = now(), updated_at = now()
          where deleted_at is null
            and variant_id in (
              select id
              from product_variant
              where product_id = $1
            )
        `,
        [normalizedId],
      );

      await client.query(
        `
          update money_amount
          set deleted_at = now(), updated_at = now()
          where deleted_at is null
            and id in (
              select pvma.money_amount_id
              from product_variant_money_amount pvma
              join product_variant pv on pv.id = pvma.variant_id
              where pv.product_id = $1
            )
        `,
        [normalizedId],
      );

      await client.query(
        `
          update product_variant
          set deleted_at = now(), updated_at = now()
          where product_id = $1
            and deleted_at is null
        `,
        [normalizedId],
      );

      const result = await client.query<{ id: string }>(
        `
          update product
          set deleted_at = now(), updated_at = now()
          where id = $1
            and deleted_at is null
          returning id
        `,
        [normalizedId],
      );

      await client.query("commit");

      return Boolean(result.rows[0]?.id);
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}

type UpdateAdminProductInput = {
  productId: string;
  brandName: string;
  modelName: string;
  title: string;
  handle: string;
  description?: string;
  thumbnail?: string;
  inventory: number;
  price: number;
  status: "draft" | "published" | "proposed" | "rejected";
  color?: string;
  storage?: string;
  imei?: string;
  gradingData?: string;
  batteryHealth?: number | null;
  referenceUrl?: string;
};

export async function updateAdminProduct(input: UpdateAdminProductInput) {
  return withClient(async (client) => {
    const productId = input.productId.trim();
    const title = input.title.trim();
    const description = input.description?.trim() || null;
    const thumbnail = input.thumbnail?.trim() || null;
    const gradingData = input.gradingData?.trim() || null;
    const batteryHealth =
      typeof input.batteryHealth === "number" ? input.batteryHealth : null;

    if (!productId) {
      throw new Error("Product id is required.");
    }

    if (!title) {
      throw new Error("Product title is required.");
    }

    if (!Number.isFinite(input.inventory) || input.inventory < 0) {
      throw new Error("Inventory must be zero or greater.");
    }

    if (!Number.isFinite(input.price) || input.price < 0) {
      throw new Error("Price must be zero or greater.");
    }

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

    await client.query("begin");

    try {
      const existingProduct = await client.query<{
        id: string;
        metadata: Record<string, unknown> | null;
      }>(
        `
          select id, metadata
          from product
          where id = $1
            and deleted_at is null
          limit 1
        `,
        [productId],
      );

      if (!existingProduct.rows[0]?.id) {
        throw new Error("Product was not found.");
      }

      const handle = await getUniqueProductHandle(client, input.handle, productId);
      const metadata = buildProductMetadata(
        existingProduct.rows[0]?.metadata || undefined,
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

      await client.query(
        `
          update product
          set
            title = $2,
            description = $3,
            handle = $4,
            thumbnail = $5,
            battery_health = $6,
            grading_data = $7,
            metadata = $8,
            status = $9,
            updated_at = now()
          where id = $1
        `,
        [
          productId,
          title,
          description,
          handle,
          thumbnail,
          batteryHealth,
          gradingData,
          metadata,
          input.status,
        ],
      );

      await client.query(
        `
          update product_variant
          set
            inventory_quantity = $2,
            updated_at = now()
          where product_id = $1
            and deleted_at is null
        `,
        [productId, input.inventory],
      );

      await client.query(
        `
          update money_amount
          set
            amount = $2,
            updated_at = now()
          where id in (
            select pvma.money_amount_id
            from product_variant_money_amount pvma
            join product_variant pv on pv.id = pvma.variant_id
            where pv.product_id = $1
              and pv.deleted_at is null
              and pvma.deleted_at is null
          )
            and deleted_at is null
        `,
        [productId, input.price],
      );

      await client.query("commit");
      return true;
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}

export async function getAdminSettingsData() {
  return withClient(async (client) => {
    const storeResult = await client.query<{
      name: string | null;
      default_currency_code: string | null;
      default_sales_channel_id: string | null;
    }>(
      "select name, default_currency_code, default_sales_channel_id from store limit 1",
    );
    const salesChannelsResult = await client.query<{
      id: string;
      name: string;
      description: string | null;
      is_disabled: boolean;
    }>(
      "select id, name, description, is_disabled from sales_channel order by created_at asc",
    );
    const productCountResult = await client.query<{ count: number }>(
      'select count(*)::int as count from "product"',
    );

    return {
      store: storeResult.rows[0] ?? null,
      salesChannels: salesChannelsResult.rows,
      productCount: productCountResult.rows[0]?.count ?? 0,
    };
  });
}
