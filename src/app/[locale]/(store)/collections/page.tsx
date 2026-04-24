import Link from "next/link";
import { Building2, Headphones, Laptop, LayoutGrid, Watch } from "lucide-react";

import { getCatalogProducts } from "@/lib/catalog-data";
import { generateLocaleStaticParams } from "@/lib/locales";
import { inferBrand, inferProductProfile } from "@/lib/product-specs";
import { getTranslator } from "@/lib/translations";

export const generateStaticParams = generateLocaleStaticParams;

type CollectionsPageProps = {
  params: { locale: string };
  searchParams?: { organize?: string };
};

export default async function CollectionsPage({
  params: { locale },
  searchParams,
}: CollectionsPageProps) {
  const t = getTranslator(locale);
  const organizeMode = searchParams?.organize === "category" ? "category" : "brand";
  const products = await getCatalogProducts();

  const collections = [
    {
      title: t("collections.audioTitle"),
      description: t("collections.audioDescription"),
      href: `/${locale}/collections/audio`,
      cta: t("collections.audioCta"),
      icon: Headphones,
    },
    {
      title: t("collections.computingTitle"),
      description: t("collections.computingDescription"),
      href: `/${locale}/collections/computing`,
      cta: t("collections.computingCta"),
      icon: Laptop,
    },
    {
      title: t("collections.wearablesTitle"),
      description: t("collections.wearablesDescription"),
      href: `/${locale}/collections/wearables`,
      cta: t("collections.wearablesCta"),
      icon: Watch,
    },
  ];
  const productsByBrand = Array.from(
    products.reduce(
      (groups, product) => {
        const brand =
          inferBrand({
            title: product.title,
            handle: product.handle,
            metadata: product.metadata,
          }) || t("collections.otherBrand");
        const entry = groups.get(brand) || [];
        entry.push(product);
        groups.set(brand, entry);
        return groups;
      },
      new Map<string, typeof products>(),
    ),
  )
    .sort((left, right) => right[1].length - left[1].length || left[0].localeCompare(right[0]))
    .map(([brand, brandProducts]) => ({
      brand,
      href: `/${locale}/search?q=${encodeURIComponent(brand)}`,
      countLabel: t("collections.brandCount", brandProducts.length),
      description: brandProducts
        .slice(0, 3)
        .map((product) => product.title)
        .join(" · "),
      icon:
        brandProducts.some((product) => {
          const profile = inferProductProfile({
            title: product.title,
            handle: product.handle,
            collection_id: product.collection_id,
          });
          return profile === "laptop";
        })
          ? Laptop
          : brandProducts.some((product) => {
                const profile = inferProductProfile({
                  title: product.title,
                  handle: product.handle,
                  collection_id: product.collection_id,
                });
                return profile === "watch";
              })
            ? Watch
            : Headphones,
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <section className="border-b border-gray-100 pb-8 sm:pb-10">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-600">
          {t("collections.eyebrow")}
        </p>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          {t("collections.title")}{" "}
          <span className="text-yellow-500">{t("collections.titleAccent")}</span>
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-500 sm:text-base lg:text-lg">
          {t("collections.description")}
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-gray-400">
            {t("collections.organizeLabel")}
          </p>
          <div className="grid w-full grid-cols-2 rounded-2xl border border-gray-200 bg-gray-50 p-1 sm:w-auto">
            <Link
              href={`/${locale}/collections?organize=brand`}
              className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition sm:min-w-[150px] sm:px-4 ${
                organizeMode === "brand"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Building2 className="h-4 w-4" />
              {t("collections.organizeBrand")}
            </Link>
            <Link
              href={`/${locale}/collections?organize=category`}
              className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition sm:min-w-[150px] sm:px-4 ${
                organizeMode === "category"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              {t("collections.organizeCategory")}
            </Link>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          {organizeMode === "brand"
            ? t("collections.brandSummary")
            : t("collections.categorySummary")}
        </p>
      </section>

      {organizeMode === "brand" ? (
        <section className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {productsByBrand.map((brandGroup) => (
            <Link
              key={brandGroup.brand}
              href={brandGroup.href}
              className="group rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
                <brandGroup.icon className="h-6 w-6" />
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <h2 className="text-xl font-black text-gray-900 sm:text-2xl">
                  {brandGroup.brand}
                </h2>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-black text-gray-600">
                  {brandGroup.countLabel}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                {brandGroup.description}
              </p>
              <div className="mt-6 text-sm font-bold text-yellow-600 transition-colors group-hover:text-yellow-700 sm:mt-8">
                {t("collections.brandCta")}
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection.href}
              href={collection.href}
              className="group rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
                <collection.icon className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-xl font-black text-gray-900 sm:mt-6 sm:text-2xl">
                {collection.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                {collection.description}
              </p>
              <div className="mt-6 text-sm font-bold text-yellow-600 transition-colors group-hover:text-yellow-700 sm:mt-8">
                {collection.cta}
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
