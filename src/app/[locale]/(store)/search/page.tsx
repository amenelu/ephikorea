import { ProductCard } from "@/components/product/product-card";
import { getCatalogProducts } from "@/lib/catalog-data";
import { getTranslator } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { q?: string };
}) {
  const t = getTranslator(locale);
  const query = searchParams.q?.trim() || "";
  const products = await getCatalogProducts();
  const normalizedQuery = query.toLowerCase();

  const results = normalizedQuery
    ? products.filter((product) =>
        [
          product.title,
          product.subtitle,
          product.description,
          product.handle,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery)),
      )
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-gray-100 pb-8">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-600">
          {t("search.eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900">
          {query ? t("search.resultsTitle", query) : t("search.title")}
        </h1>
        <p className="mt-2 text-gray-500">
          {query
            ? t("search.matchCount", results.length)
            : t("search.helper")}
        </p>
      </div>

      {query ? (
        results.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
            {t("search.empty")}
          </div>
        )
      ) : (
        <div className="mt-12 rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
          {t("search.start")}
        </div>
      )}
    </div>
  );
}
