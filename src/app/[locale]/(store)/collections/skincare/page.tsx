import { InfoPage } from "@/components/layout/info-page";
import { ProductCard } from "@/components/product/product-card";
import { getCatalogProducts } from "@/lib/catalog-data";
import { generateLocaleStaticParams } from "@/lib/locales";

export const generateStaticParams = generateLocaleStaticParams;
export const dynamic = "force-dynamic";

export default async function SkincareCollectionPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const products = (await getCatalogProducts()).filter(
    (product) => product.collection_id === "skincare",
  );

  return (
    <>
      <InfoPage
        locale={locale}
        eyebrow="Collections"
        title="Skincare Collection"
        description="Shop skincare products, daily routine essentials, and beauty-care items assigned from admin."
        highlights={[
          "Daily care and replenishment",
          "Beauty routine essentials",
          "Skincare products assigned from admin",
        ]}
        sections={[
          {
            title: "Product Focus",
            body: "This collection groups skincare items such as cleansers, serums, moisturizers, sunscreens, and routine-friendly care products.",
          },
          {
            title: "Shopping Context",
            body: "Use it for products where customers care about routine, skin goals, ingredient notes, and repeat purchases.",
          },
          {
            title: "Live Inventory",
            body: "Products appear here when the admin product category is set to Skincare.",
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
