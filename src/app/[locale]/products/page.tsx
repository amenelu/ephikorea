import Link from "next/link";

export default function ProductsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const allProducts = [
    {
      id: 1,
      name: "Aman mobile Ultra Wireless",
      price: "₩450,000",
      category: "Audio",
      image: "🎧",
      description: "Noise Cancelling",
    },
    {
      id: 2,
      name: "Series 5 Smart Watch",
      price: "₩620,000",
      category: "Wearables",
      image: "⌚",
      description: "Health Tracking",
    },
    {
      id: 3,
      name: "Pro Laptop 14 M3",
      price: "₩1,850,000",
      category: "Computing",
      image: "💻",
      description: "Creator Power",
    },
    {
      id: 4,
      name: "Aman mobile Vision VR",
      price: "₩1,200,000",
      category: "Gaming",
      image: "🥽",
      description: "Immersive Future",
    },
    {
      id: 5,
      name: "SoundBar Elite",
      price: "₩850,000",
      category: "Audio",
      image: "🔊",
      description: "Cinema Sound",
    },
    {
      id: 6,
      name: "Tab S Pro",
      price: "₩950,000",
      category: "Computing",
      image: "📱",
      description: "Pure Versatility",
    },
    {
      id: 7,
      name: "Earbuds X Pro",
      price: "₩220,000",
      category: "Audio",
      image: "🎙️",
      description: "Compact Clarity",
    },
    {
      id: 8,
      name: "Aman mobile Hub Monitor",
      price: "₩1,400,000",
      category: "Computing",
      image: "🖥️",
      description: "4K Clarity",
    },
    {
      id: 9,
      name: "Smart Ring Genesis",
      price: "₩350,000",
      category: "Wearables",
      image: "💍",
      description: "Biometric Data",
    },
  ];

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
        {allProducts.map((product) => (
          <Link
            key={product.id}
            href={`/${locale}/products/${product.id}`}
            className="group relative block"
          >
            <div className="aspect-[4/5] flex w-full items-center justify-center rounded-3xl bg-gray-50 text-7xl transition-all group-hover:bg-gray-100 group-hover:shadow-xl">
              {product.image}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/5 rounded-3xl">
                <div className="rounded-full bg-yellow-500 px-6 py-2 text-xs font-black text-black uppercase shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  View Details
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600">
                  {product.category}
                </p>
                <h3 className="mt-1 text-lg font-bold text-gray-900 group-hover:text-yellow-500 transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-400">{product.description}</p>
              </div>
              <p className="text-lg font-black text-gray-900">
                {product.price}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
