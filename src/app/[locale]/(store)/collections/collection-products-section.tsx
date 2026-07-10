import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { getCatalogProducts } from "@/lib/catalog-data";

type CatalogProducts = Awaited<ReturnType<typeof getCatalogProducts>>;

type CollectionProductsSectionProps = {
  locale: string;
  title: string;
  products: CatalogProducts;
  baseHref: string;
  activeCondition?: string;
};

export function CollectionProductsSection({
  locale,
  title,
  products,
  baseHref,
  activeCondition,
}: CollectionProductsSectionProps) {
  const normalizedCondition =
    activeCondition === "new" || activeCondition === "certified-pre-owned"
      ? activeCondition
      : "all";
  const filteredProducts = products.filter((product) => {
    if (normalizedCondition === "new") {
      return !product.is_certified_pre_owned;
    }

    if (normalizedCondition === "certified-pre-owned") {
      return product.is_certified_pre_owned;
    }

    return true;
  });
  const filters = [
    { label: "All", value: "all", href: baseHref },
    { label: "New", value: "new", href: `${baseHref}?condition=new` },
    {
      label: "Certified Pre-Owned",
      value: "certified-pre-owned",
      href: `${baseHref}?condition=certified-pre-owned`,
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <header className="border-b border-gray-100 pb-6 sm:pb-8">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-600">
          Collections
        </p>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Link
              key={filter.value}
              href={filter.href}
              className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
                normalizedCondition === filter.value
                  ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                  : "border-gray-200 text-gray-600 hover:border-yellow-300 hover:text-gray-900"
              }`}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </header>

      {filteredProducts.length > 0 ? (
        <section className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </section>
      ) : null}
    </main>
  );
}
