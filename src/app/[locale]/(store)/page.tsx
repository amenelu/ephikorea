import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { getCatalogProducts } from "@/lib/catalog-data";

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const featuredProducts = await getCatalogProducts(3);

  return (
    <div className="flex flex-col gap-12 pb-20">
      <section className="relative min-h-[520px] w-full overflow-hidden bg-black sm:h-[70vh]">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <span className="mb-4 text-sm font-bold uppercase tracking-widest text-yellow-500">
            Next Generation Electronics
          </span>
          <h1 className="text-4xl font-black tracking-tighter text-white sm:text-7xl lg:text-8xl">
            AMAN<span className="text-yellow-500">MOBILE</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-gray-400">
            Browse the latest products available in your live Medusa catalog.
          </p>
          <Link
            href={`/${locale}/products`}
            className="mt-10 rounded-full bg-yellow-500 px-8 py-4 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
          >
            Explore Collection
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 border-b border-gray-100 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
            Featured Products
          </h2>
          <Link
            href={`/${locale}/products`}
            className="text-sm font-bold text-yellow-600 hover:underline"
          >
            View All
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
            No products are in the catalog yet.
          </div>
        )}
      </section>
    </div>
  );
}
