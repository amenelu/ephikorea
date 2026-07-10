import { InfoPage } from "@/components/layout/info-page";
import { ProductCard } from "@/components/product/product-card";
import { getCatalogProducts } from "@/lib/catalog-data";
import { generateLocaleStaticParams } from "@/lib/locales";

export const generateStaticParams = generateLocaleStaticParams;
export const dynamic = "force-dynamic";

export default async function ComputingCollectionPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const products = (await getCatalogProducts()).filter(
    (product) => product.collection_id === "computing",
  );

  return (
    <>
      <InfoPage
        locale={locale}
        eyebrow="Collections"
        title="Computing Collection"
        description="Shop productivity devices, tablets, laptops, and work-ready accessories assigned from admin."
        highlights={[
          "Portable productivity devices",
          "Accessories for desks and hybrid work",
          "Computing products assigned from admin",
        ]}
        sections={[
          {
            title: "Product Focus",
            body: "This collection groups laptops, tablets, monitors, keyboards, and charging accessories into one work-and-create category.",
          },
          {
            title: "Shopping Context",
            body: "Use it for campaign traffic centered on study, remote work, business buying, or creator setups.",
          },
          {
            title: "Live Inventory",
            body: "Products appear here when the admin product category is set to Computing.",
          },
        ]}
        primaryLink={{ href: `/${locale}/products`, label: "See the catalog" }}
        secondaryLink={{ href: `/${locale}/cart`, label: "Build a setup" }}
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
