import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";

export default function ProductDetailsPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  // Hardcoded mock data to match the products listing
  const allProducts = [
    {
      id: 1,
      name: "EPHI Ultra Wireless",
      price: "₩450,000",
      category: "Audio",
      image: "🎧",
      description:
        "Flagship noise-cancelling headphones designed for professional-grade audio fidelity.",
    },
    {
      id: 2,
      name: "Series 5 Smart Watch",
      price: "₩620,000",
      category: "Wearables",
      image: "⌚",
      description:
        "Advanced health tracking and seamless connectivity in our most elegant wearable yet.",
    },
    {
      id: 3,
      name: "Pro Laptop 14 M3",
      price: "₩1,850,000",
      category: "Computing",
      image: "💻",
      description:
        "Unprecedented performance for creators, powered by the next generation EPHI Silicon.",
    },
    {
      id: 4,
      name: "EPHI Vision VR",
      price: "₩1,200,000",
      category: "Gaming",
      image: "🥽",
      description:
        "Explore new worlds with high-fidelity optics and spatial audio immersion.",
    },
    {
      id: 5,
      name: "SoundBar Elite",
      price: "₩850,000",
      category: "Audio",
      image: "🔊",
      description:
        "Transform your home cinema experience with cinematic spatial sound technology.",
    },
    {
      id: 6,
      name: "Tab S Pro",
      price: "₩950,000",
      category: "Computing",
      image: "📱",
      description:
        "Versatile, powerful, and remarkably thin. The ultimate tool for modern productivity.",
    },
    {
      id: 7,
      name: "Earbuds X Pro",
      price: "₩220,000",
      category: "Audio",
      image: "🎙️",
      description:
        "Crystal clear communication and deep bass in a compact, ergonomic design.",
    },
    {
      id: 8,
      name: "EPHI Hub Monitor",
      price: "₩1,400,000",
      category: "Computing",
      image: "🖥️",
      description:
        "A stunning 4K workspace that brings every detail to life with vivid color accuracy.",
    },
    {
      id: 9,
      name: "Smart Ring Genesis",
      price: "₩350,000",
      category: "Wearables",
      image: "💍",
      description:
        "Invisible tech, visible health. Biometric tracking packed into a refined titanium ring.",
    },
  ];

  const product = allProducts.find((p) => p.id === parseInt(id));

  if (!product) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link
          href={`/${locale}/products`}
          className="text-yellow-600 font-bold hover:underline"
        >
          Return to collection
        </Link>
      </div>
    );
  }

  // Logic for Similar Products (same category, excluding current)
  const similarProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  // Mock specifications based on category
  const specs = {
    Audio: [
      { label: "Connectivity", value: "Bluetooth 5.3 / Wired" },
      { label: "Battery Life", value: "Up to 40 hours" },
      { label: "Drivers", value: "40mm Beryllium" },
      { label: "Noise Control", value: "Active Adaptive ANC" },
    ],
    Wearables: [
      { label: "Sensors", value: "Heart Rate, SpO2, ECG, Sleep" },
      { label: "Display", value: '1.4" AMOLED Retina' },
      { label: "Material", value: "Aerospace Titanium" },
      { label: "Water Resistance", value: "IP68 / 5ATM" },
    ],
    Computing: [
      { label: "Processor", value: "EPHI Silicon M3 Max" },
      { label: "Memory", value: "16GB Unified RAM" },
      { label: "Storage", value: "512GB Ultra-Fast SSD" },
      { label: "Battery", value: "18-Hour Runtime" },
    ],
    Gaming: [
      { label: "Resolution", value: "4K Per Eye" },
      { label: "Refresh Rate", value: "120Hz Low Latency" },
      { label: "Tracking", value: "Inside-Out 6DOF" },
      { label: "Audio", value: "Integrated Spatial 3D" },
    ],
  }[product.category] || [
    { label: "Origin", value: "Designed in Seoul" },
    { label: "Warranty", value: "2 Year Premium Coverage" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation */}
      <Link
        href={`/${locale}/products`}
        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Collection
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Picture Section */}
        <div className="aspect-square w-full overflow-hidden rounded-3xl bg-gray-50 flex items-center justify-center text-[12rem] sm:text-[16rem] shadow-inner select-none">
          {product.image}
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center">
          <div className="mb-6">
            <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-[10px] font-black text-yellow-700 uppercase tracking-widest">
              {product.category}
            </span>
            <h1 className="mt-4 text-4xl font-black text-gray-900 sm:text-5xl uppercase tracking-tighter">
              {product.name}
            </h1>
            <p className="mt-4 text-lg text-gray-500 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mb-8">
            <p className="text-3xl font-black text-black">{product.price}</p>
            <p className="text-xs text-gray-400 mt-1 italic">
              Free express shipping & local taxes included.
            </p>
          </div>

          <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-black py-5 text-base font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98] shadow-2xl">
            <ShoppingBag className="h-5 w-5 text-yellow-500" />
            Add to Shopping Bag
          </button>

          {/* Branding Value Props */}
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-gray-100 pt-10">
            <div className="flex flex-col items-center text-center gap-2">
              <Truck className="h-5 w-5 text-yellow-600" />
              <p className="text-[10px] font-black uppercase tracking-tight">
                Express
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-2 border-x border-gray-100 px-2">
              <ShieldCheck className="h-5 w-5 text-yellow-600" />
              <p className="text-[10px] font-black uppercase tracking-tight">
                Global Care
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <RotateCcw className="h-5 w-5 text-yellow-600" />
              <p className="text-[10px] font-black uppercase tracking-tight">
                Returns
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Spec Sheet */}
      <section className="mt-24 border-t border-gray-100 pt-16">
        <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase mb-10">
          Technical <span className="text-yellow-500">Data</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2">
          {specs.map((spec, i) => (
            <div
              key={i}
              className="flex justify-between border-b border-gray-50 py-5"
            >
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                {spec.label}
              </span>
              <span className="text-sm text-gray-900 font-bold">
                {spec.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="mt-32">
          <div className="flex items-end justify-between border-b border-gray-100 pb-8 mb-12">
            <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase">
              Similar <span className="text-yellow-500">Innovation</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {similarProducts.map((p) => (
              <Link
                key={p.id}
                href={`/${locale}/products/${p.id}`}
                className="group"
              >
                <div className="aspect-[4/5] flex w-full items-center justify-center rounded-3xl bg-gray-50 text-6xl transition-all group-hover:bg-white group-hover:shadow-2xl">
                  {p.image}
                </div>
                <div className="mt-6">
                  <h3 className="text-sm font-black text-gray-900 group-hover:text-yellow-500 transition-colors uppercase tracking-tighter">
                    {p.name}
                  </h3>
                  <p className="text-sm font-medium text-gray-400">{p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
