import Link from "next/link";
import Medusa from "@medusajs/medusa-js";

const medusa = new Medusa({
  baseUrl:
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
  maxRetries: 3,
});

async function getProducts() {
  const { products } = await medusa.products.list();
  return products;
}

export default async function ProductsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
            Aman mobile <span className="text-yellow-500">Collection</span>
          </h1>
          <p className="mt-2 text-gray-500">
            Discover our full range of innovative technology.
          </p>
        </div>
        <div className="flex gap-2">
          {["All", "Audio", "Computing", "Wearables"].map((cat) => (
            <button
              key={cat}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                cat === "All"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/${locale}/products/${product.id}`}
            className="group relative block"
          >
            <div className="aspect-[4/5] flex w-full items-center justify-center rounded-3xl bg-gray-50 text-7xl transition-all group-hover:bg-gray-100 group-hover:shadow-xl">
              📦
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/5 rounded-3xl">
                <div className="rounded-full bg-yellow-500 px-6 py-2 text-xs font-black text-black uppercase shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  View Details
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600">
                  {product.subtitle || "Aman mobile"}
                </p>
                <h3 className="mt-1 text-lg font-bold text-gray-900 group-hover:text-yellow-500 transition-colors">
                  {product.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-1">
                  {product.description}
                </p>
              </div>
              <p className="text-lg font-black text-gray-900">
                {product.variants?.[0]?.prices?.[0]
                  ? `$${(product.variants[0].prices[0].amount / 100).toFixed(2)}`
                  : "TBD"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
