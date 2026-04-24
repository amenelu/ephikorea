import { ProductCard } from "@/components/product/product-card";
import { getCatalogProducts } from "@/lib/catalog-data";
import { getTranslator } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = getTranslator(locale);
  const products = await getCatalogProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 sm:text-3xl">
            {t("products.title")}{" "}
            <span className="text-yellow-500">{t("products.titleAccent")}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
            {t("products.description")}
          </p>
        </div>
        <p className="text-sm font-medium text-gray-500">
          {t("products.count", products.length)}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500 sm:mt-12 sm:p-12">
          {t("products.empty")}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
