import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { getCatalogProducts } from "@/lib/catalog-data";
import { getTranslator } from "@/lib/translations";

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = getTranslator(locale);
  const featuredProducts = await getCatalogProducts(3);

  return (
    <div className="flex flex-col gap-10 pb-16 sm:gap-12 sm:pb-20">
      <section className="relative min-h-[336px] w-full overflow-hidden bg-black sm:min-h-[420px] sm:h-[58vh]">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pb-6 pt-10 text-center sm:pb-8 sm:pt-0">
          <span className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-yellow-500 sm:mb-4 sm:text-sm sm:tracking-widest">
            {t("home.eyebrow")}
          </span>
          <h1 className="text-3xl font-black tracking-tighter text-white sm:text-6xl lg:text-7xl">
            {t("common.brand")}
            <span className="text-yellow-500">{t("common.brandAccent")}</span>
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-gray-400 sm:mt-5 sm:max-w-2xl sm:text-lg sm:leading-7">
            {t("home.description")}
          </p>
          <Link
            href={`/${locale}/collections`}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-yellow-500 px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95 sm:mt-8 sm:px-8 sm:py-4"
          >
            {t("home.cta")}
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pb-0 sm:border-b sm:border-gray-100 sm:pb-6">
          <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
            {t("home.featured")}
          </h2>
        </div>

        {featuredProducts.length > 0 ? (
          <>
            <div className="mt-0 grid grid-cols-1 gap-5 pt-0 sm:pt-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
            <div className="mt-6 flex justify-start sm:mt-8 sm:justify-center">
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center justify-center rounded-full border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:border-yellow-500 hover:text-yellow-600"
              >
                {t("home.viewAll")}
              </Link>
            </div>
          </>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
            {t("home.empty")}
          </div>
        )}
      </section>
    </div>
  );
}
