import Link from "next/link";
import { ArrowLeft, Footprints, Sparkles } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import { getCatalogProducts } from "@/lib/catalog-data";
import { generateLocaleStaticParams } from "@/lib/locales";
import { buildPageMetadata } from "@/lib/seo";

export const generateStaticParams = generateLocaleStaticParams;
export const dynamic = "force-dynamic";

type LifestyleCollectionPageProps = {
  params: { locale: string };
};

export function generateMetadata({
  params: { locale },
}: LifestyleCollectionPageProps) {
  return buildPageMetadata({
    locale,
    pathname: "/collections/lifestyle",
    title: "Lifestyle Collection",
    description:
      "Shop Aman Mobiles lifestyle products, including skincare and shoes, in one dedicated collection.",
  });
}

export default async function LifestyleCollectionPage({
  params: { locale },
}: LifestyleCollectionPageProps) {
  const products = await getCatalogProducts();
  const skincareProducts = products.filter(
    (product) => product.collection_id === "skincare",
  );
  const shoeProducts = products.filter(
    (product) => product.collection_id === "shoes",
  );

  const sections = [
    {
      title: "Skincare",
      href: `/${locale}/collections/skincare`,
      icon: Sparkles,
      products: skincareProducts,
    },
    {
      title: "Shoes",
      href: `/${locale}/collections/shoes`,
      icon: Footprints,
      products: shoeProducts,
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <Link
        href={`/${locale}/collections`}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-600 transition hover:border-yellow-300 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Collections
      </Link>

      <header className="border-b border-gray-100 pb-8 sm:pb-10">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-600">
          Lifestyle Side
        </p>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Lifestyle Collection
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-500 sm:text-base lg:text-lg">
          Skincare and shoes live here together, separate from the electronics
          side of the catalog.
        </p>
      </header>

      <div className="mt-8 space-y-12 sm:mt-10">
        {sections.map((section) =>
          section.products.length > 0 ? (
            <section key={section.title}>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
                    <section.icon className="h-5 w-5" />
                  </span>
                  <h2 className="text-xl font-black text-gray-900 sm:text-2xl">
                    {section.title}
                  </h2>
                </div>
                <Link
                  href={section.href}
                  className="rounded-full border border-gray-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-600 transition hover:border-yellow-300 hover:text-gray-900"
                >
                  View only
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {section.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale={locale}
                  />
                ))}
              </div>
            </section>
          ) : null,
        )}
      </div>
    </main>
  );
}
