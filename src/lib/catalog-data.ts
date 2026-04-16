import "server-only";

import type { CPOProduct } from "@/types/medusa";

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

type ProductRow = {
  product_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  handle: string;
  thumbnail: string | null;
  collection_id: string | null;
  status: string | null;
  metadata: Record<string, unknown> | null;
  is_certified_pre_owned: boolean | null;
  battery_health: number | null;
  grading_data: string | null;
  variant_id: string | null;
  amount: number | null;
  currency_code: string | null;
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

function mapRowsToProducts(rows: ProductRow[]) {
  const products = new Map<string, CPOProduct>();

  for (const row of rows) {
    if (!products.has(row.product_id)) {
      products.set(row.product_id, {
        id: row.product_id,
        title: row.title,
        subtitle: row.subtitle || undefined,
        description: row.description || undefined,
        handle: row.handle,
        thumbnail: row.thumbnail || undefined,
        collection_id: row.collection_id || undefined,
        status: row.status || undefined,
        metadata: row.metadata || null,
        is_certified_pre_owned: row.is_certified_pre_owned ?? undefined,
        battery_health: row.battery_health ?? undefined,
        grading_data: row.grading_data || undefined,
        variants: [],
      } as unknown as CPOProduct);
    }

    const product = products.get(row.product_id)!;

    if (!row.variant_id) {
      continue;
    }

    const existingVariant = product.variants.find(
      (variant) => variant.id === row.variant_id,
    );

    if (existingVariant) {
      if (typeof row.amount === "number") {
        existingVariant.prices.push({
          amount: row.amount,
          currency_code: row.currency_code || undefined,
        });
      }

      continue;
    }

    product.variants.push({
      id: row.variant_id,
      prices:
        typeof row.amount === "number"
          ? [
              {
                amount: row.amount,
                currency_code: row.currency_code || undefined,
              },
            ]
          : [],
    });
  }

  return Array.from(products.values());
}

export async function getCatalogProducts() {
  return withClient(async (client) => {
    const { rows } = await client.query<ProductRow>(`
      select
        p.id as product_id,
        p.title,
        p.subtitle,
        p.description,
        p.handle,
        p.thumbnail,
        p.collection_id,
        p.status,
        p.metadata,
        p.is_certified_pre_owned,
        p.battery_health,
        p.grading_data,
        pv.id as variant_id,
        ma.amount,
        ma.currency_code
      from product p
      left join product_variant pv
        on pv.product_id = p.id
        and pv.deleted_at is null
      left join product_variant_money_amount pvma
        on pvma.variant_id = pv.id
        and pvma.deleted_at is null
      left join money_amount ma
        on ma.id = pvma.money_amount_id
        and ma.deleted_at is null
      where p.deleted_at is null
      order by p.created_at desc, pv.created_at asc, ma.created_at asc
    `);

    return mapRowsToProducts(rows);
  });
}

export async function getCatalogProductByIdOrHandle(idOrHandle: string) {
  return withClient(async (client) => {
    const { rows } = await client.query<ProductRow>(
      `
        select
          p.id as product_id,
          p.title,
          p.subtitle,
          p.description,
          p.handle,
          p.thumbnail,
          p.collection_id,
          p.status,
          p.metadata,
          p.is_certified_pre_owned,
          p.battery_health,
          p.grading_data,
          pv.id as variant_id,
          ma.amount,
          ma.currency_code
        from product p
        left join product_variant pv
          on pv.product_id = p.id
          and pv.deleted_at is null
        left join product_variant_money_amount pvma
          on pvma.variant_id = pv.id
          and pvma.deleted_at is null
        left join money_amount ma
          on ma.id = pvma.money_amount_id
          and ma.deleted_at is null
        where p.deleted_at is null
          and (p.id = $1 or p.handle = $1)
        order by p.created_at desc, pv.created_at asc, ma.created_at asc
      `,
      [idOrHandle],
    );

    return mapRowsToProducts(rows)[0] ?? null;
  });
}

export function getCatalogProductPrice(product: {
  variants?: Array<{
    prices?: Array<{
      amount: number;
    }>;
  }>;
}) {
  return product.variants?.[0]?.prices?.[0]?.amount ?? 0;
}
