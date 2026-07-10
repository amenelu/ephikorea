import { ProductCard } from "@/components/product/product-card";
import { getCatalogProducts } from "@/lib/catalog-data";

type CatalogProducts = Awaited<ReturnType<typeof getCatalogProducts>>;

type CollectionProductsSectionProps = {
  locale: string;
  title: string;
  products: CatalogProducts;
};

export function CollectionProductsSection({
  locale,
  title,
  products,
}: CollectionProductsSectionProps) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <header className="border-b border-gray-100 pb-6 sm:pb-8">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-600">
          Collections
        </p>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          {title}
        </h1>
      </header>

      {products.length > 0 ? (
        <section className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </section>
      ) : null}
    </main>
  );
}
