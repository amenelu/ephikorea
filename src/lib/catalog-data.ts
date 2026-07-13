import "server-only";

import { getDb, parseJsonObject } from "@/lib/db";
import { getProductCollectionId, getProductImageUrls } from "@/lib/media";
import { getActiveUnitPrice } from "@/lib/pricing";
import { inferBrand } from "@/lib/product-specs";
import { convertAmount } from "@/lib/utils";
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
      const metadata = parseJsonObject(row.metadata_json);
      const images = getProductImageUrls({
        thumbnail: row.thumbnail,
        metadata,
      });

      products.set(row.product_id, {
        id: row.product_id,
        title: row.title,
        subtitle: row.subtitle || undefined,
        description: row.description || undefined,
        handle: row.handle,
        thumbnail: images[0] || row.thumbnail || undefined,
        images,
        collection_id: getProductCollectionId(metadata),
        status: row.status || undefined,
        metadata,
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

async function getCatalogRows(
  options: { limit?: number; excludeProductId?: string } = {},
) {
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
  try {
    return mapRowsToProducts(await getCatalogRows({ limit }));
  } catch (error) {
    console.error("Unable to load catalog products.", error);
    return [];
  }
}

function isHomepageFeatured(product: CPOProduct) {
  return product.metadata?.featured_on_homepage === true;
}

export async function getHomepageProducts(limit = 6) {
  try {
    const products = mapRowsToProducts(await getCatalogRows());
    const featuredProducts = products.filter(isHomepageFeatured);
    const featuredIds = new Set(featuredProducts.map((product) => product.id));
    const fallbackProducts = products.filter(
      (product) => !featuredIds.has(product.id),
    );

    return [...featuredProducts, ...fallbackProducts].slice(0, limit);
  } catch (error) {
    console.error("Unable to load homepage products.", error);
    return [];
  }
}

function similarityKey(value?: string | null) {
  return value
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getActiveCatalogProductPrice(product: CPOProduct) {
  return getActiveUnitPrice({
    regularAmount: getCatalogProductPrice(product),
    metadata: product.metadata,
  });
}

function getSimilarityScore(target: CPOProduct, candidate: CPOProduct) {
  const targetCurrency = getCatalogProductCurrency(target);
  const candidatePrice = convertAmount(
    getActiveCatalogProductPrice(candidate),
    getCatalogProductCurrency(candidate),
    targetCurrency,
  );
  const targetPrice = getActiveCatalogProductPrice(target);
  const priceGap =
    targetPrice > 0 ? Math.abs(candidatePrice - targetPrice) / targetPrice : 1;
  const priceScore = Math.max(0, 40 - Math.min(priceGap, 1) * 40);
  const conditionScore =
    Boolean(candidate.is_certified_pre_owned) ===
    Boolean(target.is_certified_pre_owned)
      ? 35
      : 0;
  const stockScore = candidate.variants.some(
    (variant) => (variant.inventory_quantity ?? 0) > 0,
  )
    ? 15
    : 0;

  return conditionScore + priceScore + stockScore;
}

export async function getSimilarCatalogProducts(
  product: CPOProduct,
  limit = 3,
) {
  try {
    const targetCollection = product.collection_id;
    const targetBrand = similarityKey(inferBrand(product));
    const candidates = mapRowsToProducts(
      await getCatalogRows({
        excludeProductId: product.id,
      }),
    ).filter((candidate) => {
      if (targetCollection && candidate.collection_id !== targetCollection) {
        return false;
      }

      if (targetBrand) {
        return similarityKey(inferBrand(candidate)) === targetBrand;
      }

      return true;
    });

    return candidates
      .map((candidate, index) => ({
        candidate,
        index,
        score: getSimilarityScore(product, candidate),
      }))
      .sort(
        (left, right) => right.score - left.score || left.index - right.index,
      )
      .map((entry) => entry.candidate)
      .slice(0, limit);
  } catch (error) {
    console.error("Unable to load similar catalog products.", error);
    return [];
  }
}

export async function getCatalogProductByIdOrHandle(idOrHandle: string) {
  try {
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
  } catch (error) {
    console.error("Unable to load catalog product.", { idOrHandle, error });
    return null;
  }
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

export function getCatalogProductCurrency(product: {
  variants?: Array<{
    prices?: Array<{
      currency_code?: string;
    }>;
  }>;
}) {
  return product.variants?.[0]?.prices?.[0]?.currency_code || "usd";
}
