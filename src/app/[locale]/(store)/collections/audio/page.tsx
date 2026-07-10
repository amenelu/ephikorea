import { InfoPage } from "@/components/layout/info-page";
import { ProductCard } from "@/components/product/product-card";
import { getCatalogProducts } from "@/lib/catalog-data";
import { generateLocaleStaticParams } from "@/lib/locales";

export const generateStaticParams = generateLocaleStaticParams;
export const dynamic = "force-dynamic";

export default async function AudioCollectionPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const products = (await getCatalogProducts()).filter(
    (product) => product.collection_id === "audio",
  );

  return (
    <>
      <InfoPage
        locale={locale}
        eyebrow="Collections"
        title="Audio Collection"
        description="Explore premium listening gear curated for travelers, commuters, and everyday desk setups."
        highlights={[
          "Noise-cancelling headphones and earbuds",
          "Portable speakers with premium finishes",
          "Audio products assigned from admin",
        ]}
        sections={[
          {
            title: "Featured Gear",
            body: "Highlights include headphones, compact earbuds, and speaker systems designed for desks or mobile lifestyles.",
          },
          {
            title: "Who It Fits",
            body: "This collection is ideal for shoppers building travel kits, desk setups, or everyday listening upgrades.",
          },
          {
            title: "Live Inventory",
            body: "Products appear here when the admin product category is set to Audio.",
          },
        ]}
        primaryLink={{ href: `/${locale}/products`, label: "Browse all products" }}
        secondaryLink={{ href: `/${locale}/contact`, label: "Ask about availability" }}
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
