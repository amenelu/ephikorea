import { getCatalogProducts } from "@/lib/catalog-data";
import { generateLocaleStaticParams } from "@/lib/locales";
import { CollectionProductsSection } from "../collection-products-section";

export const generateStaticParams = generateLocaleStaticParams;
export const dynamic = "force-dynamic";

export default async function WearablesCollectionPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { condition?: string };
}) {
  const products = (await getCatalogProducts()).filter(
    (product) => product.collection_id === "wearables",
  );

  return (
    <CollectionProductsSection
      locale={locale}
      title="Wearables Collection"
      products={products}
      baseHref={`/${locale}/collections/wearables`}
      activeCondition={searchParams?.condition}
    />
  );
}
