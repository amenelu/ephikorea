import { InfoPage } from "@/components/layout/info-page";
import { ProductCard } from "@/components/product/product-card";
import { getCatalogProducts } from "@/lib/catalog-data";
import { generateLocaleStaticParams } from "@/lib/locales";

export const generateStaticParams = generateLocaleStaticParams;
export const dynamic = "force-dynamic";

export default async function WearablesCollectionPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const products = (await getCatalogProducts()).filter(
    (product) => product.collection_id === "wearables",
  );

  return (
    <>
      <InfoPage
        locale={locale}
        eyebrow="Collections"
        title="Wearables Collection"
        description="Shop smartwatches, fitness devices, and design-led wearable accessories assigned from admin."
        highlights={[
          "Smartwatches and fitness-focused devices",
          "Design-led accessories and bands",
          "Wearable products assigned from admin",
        ]}
        sections={[
          {
            title: "Collection Story",
            body: "This category is framed around tech that travels with the customer throughout the day, from work and workouts to sleep tracking.",
          },
          {
            title: "Shopping Context",
            body: "Wearables shoppers often care about comfort, ecosystem compatibility, and charge life before raw specs.",
          },
          {
            title: "Live Inventory",
            body: "Products appear here when the admin product category is set to Wearables.",
          },
        ]}
        primaryLink={{ href: `/${locale}/products`, label: "Shop devices" }}
        secondaryLink={{ href: `/${locale}/about`, label: "Learn about the brand" }}
      />
      {products.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
