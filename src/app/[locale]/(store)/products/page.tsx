import { getCatalogProducts } from "@/lib/catalog-data";
import { buildPageMetadata } from "@/lib/seo";
import { getTranslator } from "@/lib/translations";
import { CollectionProductsSection } from "../collections/collection-products-section";

export const dynamic = "force-dynamic";

export function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return buildPageMetadata({
    locale,
    pathname: "/products",
    title: "Shop All Products",
    description:
      "Browse new and certified pre-owned phones, audio, computing, and more - every item graded and checked before it ships.",
  });
}

export default async function ProductsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { brand?: string; condition?: string };
}) {
  const t = getTranslator(locale);
  const products = await getCatalogProducts();

  return (
    <CollectionProductsSection
      locale={locale}
      eyebrow="Products"
      title={`${t("products.title")} ${t("products.titleAccent")}`}
      description={t("products.description")}
      countLabel={t("products.count", products.length)}
      emptyLabel={t("products.empty")}
      products={products}
      baseHref={`/${locale}/products`}
      activeCondition={searchParams?.condition}
      activeBrand={searchParams?.brand}
      enableBrandFilter
    />
  );
}
