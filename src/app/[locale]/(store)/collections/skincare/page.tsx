import { getCatalogProducts } from "@/lib/catalog-data";
import { generateLocaleStaticParams } from "@/lib/locales";
import { CollectionProductsSection } from "../collection-products-section";

export const generateStaticParams = generateLocaleStaticParams;
export const dynamic = "force-dynamic";

export default async function SkincareCollectionPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { condition?: string };
}) {
  const products = (await getCatalogProducts()).filter(
    (product) => product.collection_id === "skincare",
  );

  return (
    <CollectionProductsSection
      locale={locale}
      title="Skincare Collection"
      products={products}
      baseHref={`/${locale}/collections/skincare`}
      activeCondition={searchParams?.condition}
    />
  );
}
