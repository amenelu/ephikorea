import { ProductCard } from "@/components/product/product-card";
import { getCatalogProducts } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const products = await getCatalogProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
            Aman mobile <span className="text-yellow-500">Collection</span>
          </h1>
          <p className="mt-2 text-gray-500">
            Discover our full range of innovative technology.
          </p>
        </div>
        <p className="text-sm font-medium text-gray-500">
          {products.length} product{products.length === 1 ? "" : "s"}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
          No products are available yet.
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
