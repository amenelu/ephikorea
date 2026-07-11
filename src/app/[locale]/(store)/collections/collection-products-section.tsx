import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { getCatalogProducts } from "@/lib/catalog-data";
import { inferBrand } from "@/lib/product-specs";
import { CollectionBrandFilter } from "./collection-brand-filter";

type CatalogProducts = Awaited<ReturnType<typeof getCatalogProducts>>;

type CollectionProductsSectionProps = {
  locale: string;
  title: string;
  products: CatalogProducts;
  baseHref: string;
  activeCondition?: string;
  activeBrand?: string;
  enableBrandFilter?: boolean;
};

export function CollectionProductsSection({
  locale,
  title,
  products,
  baseHref,
  activeCondition,
  activeBrand,
  enableBrandFilter = false,
}: CollectionProductsSectionProps) {
  const normalizedCondition =
    activeCondition === "new" || activeCondition === "certified-pre-owned"
      ? activeCondition
      : "all";
  const brandSlug = (brand: string) =>
    brand
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const conditionFilteredProducts = products.filter((product) => {
    if (normalizedCondition === "new") {
      return !product.is_certified_pre_owned;
    }

    if (normalizedCondition === "certified-pre-owned") {
      return product.is_certified_pre_owned;
    }

    return true;
  });
  const brandOptions = Array.from(
    conditionFilteredProducts.reduce((brands, product) => {
      const brand = inferBrand(product);
      const slug = brand ? brandSlug(brand) : "";

      if (brand && slug) {
        brands.set(slug, brand);
      }

      return brands;
    }, new Map<string, string>()),
  )
    .map(([value, label]) => ({ value, label }))
    .sort((left, right) => left.label.localeCompare(right.label));
  const availableBrandValues = new Set(
    brandOptions.map((brand) => brand.value),
  );
  const normalizedBrand =
    activeBrand && availableBrandValues.has(activeBrand) ? activeBrand : "all";
  const filteredProducts = conditionFilteredProducts.filter((product) => {
    if (normalizedBrand === "all") {
      return true;
    }

    const brand = inferBrand(product);
    return brand ? brandSlug(brand) === normalizedBrand : false;
  });
  const conditionHref = (condition: string) => {
    const params = new URLSearchParams();

    if (condition !== "all") {
      params.set("condition", condition);
    }

    if (normalizedBrand !== "all") {
      params.set("brand", normalizedBrand);
    }

    const query = params.toString();
    return query ? `${baseHref}?${query}` : baseHref;
  };
  const filters = [
    { label: "All", value: "all", href: conditionHref("all") },
    { label: "New", value: "new", href: conditionHref("new") },
    {
      label: "Certified Pre-Owned",
      value: "certified-pre-owned",
      href: conditionHref("certified-pre-owned"),
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
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="flex flex-wrap gap-2">
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
          {enableBrandFilter && brandOptions.length > 0 ? (
            <CollectionBrandFilter
              activeBrand={normalizedBrand}
              activeCondition={normalizedCondition}
              baseHref={baseHref}
              options={brandOptions}
            />
          ) : null}
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
