import { getCatalogProducts } from "@/lib/catalog-data";
import { generateLocaleStaticParams } from "@/lib/locales";
import { CollectionProductsSection } from "../collection-products-section";

export const generateStaticParams = generateLocaleStaticParams;
export const dynamic = "force-dynamic";

export default async function ShoesCollectionPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { brand?: string; condition?: string };
}) {
  const products = (await getCatalogProducts()).filter(
    (product) => product.collection_id === "shoes",
  );

  return (
    <CollectionProductsSection
      locale={locale}
      title="Shoes Collection"
      products={products}
      baseHref={`/${locale}/collections/shoes`}
      activeCondition={searchParams?.condition}
      activeBrand={searchParams?.brand}
      enableBrandFilter
      showConditionFilter={false}
    />
  );
}
