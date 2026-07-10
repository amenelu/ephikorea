import { InfoPage } from "@/components/layout/info-page";
import { ProductCard } from "@/components/product/product-card";
import { getCatalogProducts } from "@/lib/catalog-data";
import { generateLocaleStaticParams } from "@/lib/locales";

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
    <>
      <InfoPage
        locale={locale}
        eyebrow="Collections"
        title="Shoes Collection"
        description="Shop shoes, sneakers, and footwear products assigned from admin."
        highlights={[
          "Everyday footwear",
          "Style and gift-ready listings",
          "Shoe products assigned from admin",
        ]}
        sections={[
          {
            title: "Product Focus",
            body: "This collection groups shoes, sneakers, boots, and footwear accessories into one easy shopping entry point.",
          },
          {
            title: "Shopping Context",
            body: "Use it for products where customers care about size, fit, condition, color, and styling details.",
          },
          {
            title: "Live Inventory",
            body: "Products appear here when the admin product category is set to Shoes.",
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
