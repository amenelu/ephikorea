import { getCatalogProducts } from "@/lib/catalog-data";
import { generateLocaleStaticParams } from "@/lib/locales";
import { CollectionProductsSection } from "../collection-products-section";

export const generateStaticParams = generateLocaleStaticParams;
export const dynamic = "force-dynamic";

export default async function PhonesCollectionPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { brand?: string; condition?: string };
}) {
  const products = (await getCatalogProducts()).filter(
    (product) => product.collection_id === "phones",
  );

  return (
    <CollectionProductsSection
      locale={locale}
      title="Phones Collection"
      products={products}
      baseHref={`/${locale}/collections/phones`}
      activeCondition={searchParams?.condition}
      activeBrand={searchParams?.brand}
      enableBrandFilter
    />
  );
}
