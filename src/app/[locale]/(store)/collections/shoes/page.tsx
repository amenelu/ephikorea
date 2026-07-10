import { getCatalogProducts } from "@/lib/catalog-data";
import { generateLocaleStaticParams } from "@/lib/locales";
import { CollectionProductsSection } from "../collection-products-section";

export const generateStaticParams = generateLocaleStaticParams;
export const dynamic = "force-dynamic";

export default async function ShoesCollectionPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const products = (await getCatalogProducts()).filter(
    (product) => product.collection_id === "shoes",
  );

  return (
    <CollectionProductsSection
      locale={locale}
      title="Shoes Collection"
      products={products}
    />
  );
}
