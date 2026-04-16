import "server-only";

import { randomUUID } from "crypto";

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

type CheckoutItem = {
  variantId: string;
  quantity: number;
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

function createEntityId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").toUpperCase().slice(0, 26)}`;
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || null,
    lastName: parts.slice(1).join(" ") || null,
  };
}

export async function getCheckoutCountries() {
  return withClient(async (client) => {
    const { rows } = await client.query<{
      iso_2: string;
      display_name: string;
    }>(
      `
        select iso_2, display_name
        from country
        order by
          case when iso_2 in ('kr', 'us', 'gb', 'ae') then 0 else 1 end,
          display_name asc
      `,
    );

    return rows;
  });
}

async function ensureDefaultRegion(
  client: PgClient,
  currencyCode: string,
  countryCode: string,
) {
  const existingRegion = await client.query<{ id: string }>(
    `
      select id
      from region
      where deleted_at is null
      order by created_at asc
      limit 1
    `,
  );

  if (existingRegion.rows[0]?.id) {
    return existingRegion.rows[0].id;
  }

  const regionId = createEntityId("reg");

  await client.query(
    `
      insert into region (
        id,
        name,
        currency_code,
        tax_rate,
        created_at,
        updated_at,
        automatic_taxes,
        gift_cards_taxable
      )
      values ($1, $2, $3, 0, now(), now(), false, true)
    `,
    [regionId, "Default Checkout Region", currencyCode],
  );

  await client.query(
    `
      update country
      set region_id = $2
      where iso_2 = $1
    `,
    [countryCode, regionId],
  );

  return regionId;
}

async function getOrCreateCustomer(
  client: PgClient,
  input: {
    name: string;
    email: string;
    phone?: string;
    addressSummary: Record<string, unknown>;
    total: number;
  },
) {
  const { firstName, lastName } = splitName(input.name);
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.trim() || null;

  const existingCustomer = await client.query<{
    id: string;
    metadata: Record<string, unknown> | null;
  }>(
    `
      select id, metadata
      from customer
      where lower(email) = $1
        and deleted_at is null
      limit 1
    `,
    [email],
  );

  const latestOrder = {
    submitted_at: new Date().toISOString(),
    total: input.total,
    delivery: input.addressSummary,
  };

  if (existingCustomer.rows[0]?.id) {
    const metadata = existingCustomer.rows[0].metadata || {};
    const priorCount =
      typeof metadata.checkout_submissions === "number"
        ? metadata.checkout_submissions
        : 0;

    await client.query(
      `
        update customer
        set
          first_name = $2,
          last_name = $3,
          phone = $4,
          metadata = $5,
          updated_at = now()
        where id = $1
      `,
      [
        existingCustomer.rows[0].id,
        firstName,
        lastName,
        phone,
        {
          ...metadata,
          checkout_submissions: priorCount + 1,
          latest_checkout: latestOrder,
        },
      ],
    );

    return existingCustomer.rows[0].id;
  }

  const customerId = createEntityId("cus");

  await client.query(
    `
      insert into customer (
        id,
        email,
        first_name,
        last_name,
        phone,
        has_account,
        metadata,
        created_at,
        updated_at
      )
      values ($1, $2, $3, $4, $5, false, $6, now(), now())
    `,
    [
      customerId,
      email,
      firstName,
      lastName,
      phone,
      {
        checkout_submissions: 1,
        latest_checkout: latestOrder,
      },
    ],
  );

  return customerId;
}

export async function submitGuestOrder(input: {
  name: string;
  email: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  postalCode?: string;
  countryCode: string;
  items: CheckoutItem[];
}) {
  const fullName = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.trim() || null;
  const address1 = input.address1.trim();
  const address2 = input.address2?.trim() || null;
  const city = input.city.trim();
  const province = input.province?.trim() || null;
  const postalCode = input.postalCode?.trim() || null;
  const countryCode = input.countryCode.trim().toLowerCase();
  const items = input.items
    .filter((item) => item.variantId && item.quantity > 0)
    .map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

  if (!fullName) {
    throw new Error("Full name is required.");
  }

  if (!email) {
    throw new Error("Email address is required.");
  }

  if (!address1 || !city || !countryCode) {
    throw new Error("Delivery address is incomplete.");
  }

  if (items.length === 0) {
    throw new Error("Add at least one item before placing an order.");
  }

  return withClient(async (client) => {
    await client.query("begin");

    try {
      const storeResult = await client.query<{
        default_currency_code: string | null;
        default_sales_channel_id: string | null;
      }>("select default_currency_code, default_sales_channel_id from store limit 1");
      const currencyCode =
        storeResult.rows[0]?.default_currency_code?.toLowerCase() || "usd";
      const salesChannelId =
        storeResult.rows[0]?.default_sales_channel_id || null;

      const countryResult = await client.query<{ iso_2: string }>(
        `
          select iso_2
          from country
          where iso_2 = $1
          limit 1
        `,
        [countryCode],
      );

      if (!countryResult.rows[0]?.iso_2) {
        throw new Error("Selected delivery country is not supported.");
      }

      const regionId = await ensureDefaultRegion(client, currencyCode, countryCode);

      const variantIds = items.map((item) => item.variantId);
      const variantRows = await client.query<{
        variant_id: string;
        title: string;
        variant_title: string;
        thumbnail: string | null;
        unit_price: number;
        inventory_quantity: number;
      }>(
        `
          select
            pv.id as variant_id,
            p.title,
            pv.title as variant_title,
            p.thumbnail,
            coalesce(max(ma.amount), 0)::int as unit_price,
            pv.inventory_quantity
          from product_variant pv
          join product p on p.id = pv.product_id and p.deleted_at is null
          left join product_variant_money_amount pvma
            on pvma.variant_id = pv.id
            and pvma.deleted_at is null
          left join money_amount ma
            on ma.id = pvma.money_amount_id
            and ma.deleted_at is null
          where pv.deleted_at is null
            and pv.id = any($1)
          group by pv.id, p.id
        `,
        [variantIds],
      );

      const variants = new Map(
        variantRows.rows.map((row) => [row.variant_id, row] as const),
      );

      let total = 0;

      for (const item of items) {
        const variant = variants.get(item.variantId);

        if (!variant) {
          throw new Error("One of the cart items is no longer available.");
        }

        if (variant.inventory_quantity < item.quantity) {
          throw new Error(`Not enough stock for ${variant.title}.`);
        }

        total += variant.unit_price * item.quantity;
      }

      const customerId = await getOrCreateCustomer(client, {
        name: fullName,
        email,
        phone: phone || undefined,
        addressSummary: {
          address1,
          address2,
          city,
          province,
          postalCode,
          countryCode,
        },
        total,
      });

      const { firstName, lastName } = splitName(fullName);
      const addressId = createEntityId("addr");

      await client.query(
        `
          insert into address (
            id,
            customer_id,
            first_name,
            last_name,
            address_1,
            address_2,
            city,
            province,
            postal_code,
            country_code,
            phone,
            created_at,
            updated_at
          )
          values (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now(), now()
          )
        `,
        [
          addressId,
          customerId,
          firstName,
          lastName,
          address1,
          address2,
          city,
          province,
          postalCode,
          countryCode,
          phone,
        ],
      );

      const orderId = createEntityId("order");

      await client.query(
        `
          insert into "order" (
            id,
            customer_id,
            email,
            shipping_address_id,
            billing_address_id,
            region_id,
            currency_code,
            sales_channel_id,
            metadata,
            created_at,
            updated_at
          )
          values (
            $1, $2, $3, $4, $4, $5, $6, $7, $8, now(), now()
          )
        `,
        [
          orderId,
          customerId,
          email,
          addressId,
          regionId,
          currencyCode,
          salesChannelId,
          {
            checkout_source: "guest_checkout",
          },
        ],
      );

      for (const item of items) {
        const variant = variants.get(item.variantId)!;

        await client.query(
          `
            insert into line_item (
              id,
              order_id,
              title,
              description,
              thumbnail,
              unit_price,
              variant_id,
              quantity,
              created_at,
              updated_at
            )
            values ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())
          `,
          [
            createEntityId("item"),
            orderId,
            variant.title,
            variant.variant_title,
            variant.thumbnail,
            variant.unit_price,
            variant.variant_id,
            item.quantity,
          ],
        );

        await client.query(
          `
            update product_variant
            set
              inventory_quantity = inventory_quantity - $2,
              updated_at = now()
            where id = $1
          `,
          [variant.variant_id, item.quantity],
        );
      }

      await client.query("commit");

      return orderId;
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}
