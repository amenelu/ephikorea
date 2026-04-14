import Link from "next/link";

export default function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const featuredProducts = [
    {
      id: 1,
      name: "Aman mobile Ultra Wireless Headphones",
      price: "₩450,000",
      tag: "New Release",
    },
    {
      id: 2,
      name: "Aman mobile Smart Watch Series 5",
      price: "₩620,000",
      tag: "Best Seller",
    },
    {
      id: 3,
      name: "Aman mobile Pro Laptop 14 M3",
      price: "₩1,850,000",
      tag: "Limited Edition",
    },
  ];

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden bg-black">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <span className="mb-4 text-sm font-bold uppercase tracking-widest text-yellow-500">
            Next Generation Electronics
          </span>
          <h1 className="text-5xl font-black tracking-tighter text-white sm:text-7xl lg:text-8xl">
            AMAN<span className="text-yellow-500">MOBILE</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-gray-400">
            Redefining the standard of premium electronics with South Korean
            engineering excellence.
          </p>
          <Link
            href={`/${locale}/products`}
            className="mt-10 rounded-full bg-yellow-500 px-8 py-4 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
          >
            Explore Collection
          </Link>
        </div>
      </section>

      {/* Featured Releases Section */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between border-b border-gray-100 pb-8">
          <h2 className="text-3xl font-black tracking-tight text-gray-900">
            Featured Releases
          </h2>
          <Link
            href={`/${locale}/search`}
            className="text-sm font-bold text-yellow-600 hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/${locale}/products/${product.id}`}
              className="group block"
            >
              <div className="aspect-[4/5] flex w-full items-center justify-center rounded-3xl bg-gray-50 font-bold text-gray-300 transition-shadow group-hover:shadow-2xl">
                Image Placeholder
              </div>
              <div className="mt-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600">
                  {product.tag}
                </span>
                <h3 className="mt-1 text-lg font-bold text-gray-900 group-hover:text-yellow-500 transition-colors">
                  {product.name}
                </h3>
                <p className="mt-1 text-gray-500">{product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
