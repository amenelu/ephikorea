import "server-only";

import { getDb, parseJsonObject } from "@/lib/db";
import type { CPOProduct } from "@/types/product";

type CatalogProductRow = {
  product_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  handle: string;
  thumbnail: string | null;
  status: string | null;
  metadata_json: string | null;
  is_certified_pre_owned: number | null;
  battery_health: number | null;
  grading_data: string | null;
  variant_id: string | null;
  variant_title: string | null;
  inventory_quantity: number | null;
  price_amount: number | null;
  currency_code: string | null;
};

function mapRowsToProducts(rows: CatalogProductRow[]) {
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
        status: row.status || undefined,
        metadata: parseJsonObject(row.metadata_json),
        is_certified_pre_owned: Boolean(row.is_certified_pre_owned),
        battery_health: row.battery_health ?? undefined,
        grading_data: row.grading_data || undefined,
        variants: [],
      });
    }

    if (!row.variant_id) {
      continue;
    }

    products.get(row.product_id)!.variants.push({
      id: row.variant_id,
      title: row.variant_title || undefined,
      inventory_quantity: row.inventory_quantity ?? undefined,
      prices: [
        {
          amount: row.price_amount ?? 0,
          currency_code: row.currency_code || undefined,
        },
      ],
    });
  }

  return Array.from(products.values());
}

async function getCatalogRows(options: { limit?: number; excludeProductId?: string } = {}) {
  const db = await getDb();
  const params: Record<string, unknown> = {};
  const where = ["p.deleted_at is null"];

  if (options.excludeProductId) {
    where.push("p.id <> @excludeProductId");
    params.excludeProductId = options.excludeProductId;
  }

  const limit =
    typeof options.limit === "number" && Number.isFinite(options.limit)
      ? Math.max(1, Math.floor(options.limit))
      : undefined;
  const limitClause = limit ? `limit ${limit}` : "";

  return db
    .prepare(
      `
        with selected_products as (
          select p.*, p.rowid as product_sort_id
          from products p
          where ${where.join(" and ")}
          order by p.created_at desc, p.rowid desc
          ${limitClause}
        )
        select
          p.id as product_id,
          p.title,
          p.subtitle,
          p.description,
          p.handle,
          p.thumbnail,
          p.status,
          p.metadata_json,
          p.is_certified_pre_owned,
          p.battery_health,
          p.grading_data,
          pv.id as variant_id,
          pv.title as variant_title,
          pv.inventory_quantity,
          pv.price_amount,
          pv.currency_code
        from selected_products p
        left join product_variants pv
          on pv.product_id = p.id
          and pv.deleted_at is null
        order by p.created_at desc, p.product_sort_id desc, pv.created_at asc
      `,
    )
    .all<CatalogProductRow>(params);
}

export async function getCatalogProducts(limit?: number) {
  return mapRowsToProducts(await getCatalogRows({ limit }));
}

export async function getSimilarCatalogProducts(productId: string, limit = 3) {
  return mapRowsToProducts(
    await getCatalogRows({
      excludeProductId: productId,
      limit,
    }),
  );
}

export async function getCatalogProductByIdOrHandle(idOrHandle: string) {
  const db = await getDb();
  const rows = await db
    .prepare(
      `
        select
          p.id as product_id,
          p.title,
          p.subtitle,
          p.description,
          p.handle,
          p.thumbnail,
          p.status,
          p.metadata_json,
          p.is_certified_pre_owned,
          p.battery_health,
          p.grading_data,
          pv.id as variant_id,
          pv.title as variant_title,
          pv.inventory_quantity,
          pv.price_amount,
          pv.currency_code
        from products p
        left join product_variants pv
          on pv.product_id = p.id
          and pv.deleted_at is null
        where p.deleted_at is null
          and (p.id = @idOrHandle or p.handle = @idOrHandle)
        order by pv.created_at asc
      `,
    )
    .all<CatalogProductRow>({ idOrHandle });

  return mapRowsToProducts(rows)[0] ?? null;
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
