import { InfoPage } from "@/components/layout/info-page";
import { ProductCard } from "@/components/product/product-card";
import { getCatalogProducts } from "@/lib/catalog-data";
import { generateLocaleStaticParams } from "@/lib/locales";

export const generateStaticParams = generateLocaleStaticParams;
export const dynamic = "force-dynamic";

export default async function PhonesCollectionPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const products = (await getCatalogProducts()).filter(
    (product) => product.collection_id === "phones",
  );

  return (
    <>
      <InfoPage
        locale={locale}
        eyebrow="Collections"
        title="Phones Collection"
        description="Shop new and certified pre-owned phones assigned from admin."
        highlights={[
          "New and certified pre-owned devices",
          "Clear product details and gallery images",
          "Phone products assigned from admin",
        ]}
        sections={[
          {
            title: "Product Focus",
            body: "This collection groups phones into one direct shopping path for customers browsing available devices.",
          },
          {
            title: "Shopping Context",
            body: "Use it for iPhone, Samsung Galaxy, Google Pixel, and other mobile device listings.",
          },
          {
            title: "Live Inventory",
            body: "Products appear here when the admin product category is set to Phones.",
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
