import { getCatalogProducts } from "@/lib/catalog-data";
import { generateLocaleStaticParams } from "@/lib/locales";
import { CollectionProductsSection } from "../collection-products-section";

export const generateStaticParams = generateLocaleStaticParams;
export const dynamic = "force-dynamic";

export default async function AudioCollectionPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { brand?: string; condition?: string };
}) {
  const products = (await getCatalogProducts()).filter(
    (product) => product.collection_id === "audio",
  );

  return (
    <CollectionProductsSection
      locale={locale}
      title="Audio Collection"
      products={products}
      baseHref={`/${locale}/collections/audio`}
      activeCondition={searchParams?.condition}
      activeBrand={searchParams?.brand}
      enableBrandFilter
    />
  );
}
