import { getCatalogProducts } from "@/lib/catalog-data";
import { generateLocaleStaticParams } from "@/lib/locales";
import { CollectionProductsSection } from "../collection-products-section";

export const generateStaticParams = generateLocaleStaticParams;
export const dynamic = "force-dynamic";

export default async function AccessoriesCollectionPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { brand?: string; condition?: string };
}) {
  const products = (await getCatalogProducts()).filter(
    (product) => product.collection_id === "accessories",
  );

  return (
    <CollectionProductsSection
      locale={locale}
      title="Accessories Collection"
      products={products}
      baseHref={`/${locale}/collections/accessories`}
      activeCondition={searchParams?.condition}
      activeBrand={searchParams?.brand}
      enableBrandFilter
    />
  );
}
