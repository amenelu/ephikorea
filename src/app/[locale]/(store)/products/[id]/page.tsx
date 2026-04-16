import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/modules/add-to-cart-button";
import { ProductCard } from "@/components/product/product-card";
import {
  getCatalogProductByIdOrHandle,
  getCatalogProductPrice,
  getCatalogProducts,
} from "@/lib/catalog-data";
import { buildProductSpecSheet } from "@/lib/product-specs";
import { formatAmount } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const [product, products] = await Promise.all([
    getCatalogProductByIdOrHandle(id),
    getCatalogProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const price = getCatalogProductPrice(product);
  const primaryVariant = product.variants?.[0];
  const similarProducts = products
    .filter((item) => item.id !== product.id)
    .slice(0, 3);

  const specs = buildProductSpecSheet(product);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/${locale}/products`}
        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-gray-400 transition-colors hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Collection
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-gray-50 shadow-inner">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-contain p-10"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center text-sm font-semibold uppercase tracking-[0.3em] text-gray-300">
              No image available
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-6">
            {product.is_certified_pre_owned && (
              <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
                Certified Pre-Owned
              </span>
            )}
            <h1 className="mt-4 text-4xl font-black uppercase tracking-tighter text-gray-900 sm:text-5xl">
              {product.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-500">
              {product.description ||
                product.subtitle ||
                "No description available yet."}
            </p>
          </div>

          <div className="mb-8">
            <p className="text-3xl font-black text-black">
              {formatAmount(price)}
            </p>
            <p className="mt-1 text-xs italic text-gray-400">
              Free express shipping & local taxes included.
            </p>
          </div>

          {primaryVariant?.id ? (
            <AddToCartButton
              locale={locale}
              variantId={primaryVariant.id}
              title={product.title}
              thumbnail={product.thumbnail || undefined}
              unitPrice={price}
            />
          ) : (
            <button
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center rounded-2xl bg-gray-200 py-5 text-base font-bold text-gray-500"
            >
              Variant unavailable
            </button>
          )}

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-gray-100 pt-10">
            <div className="flex flex-col items-center gap-2 text-center">
              <Truck className="h-5 w-5 text-yellow-600" />
              <p className="text-[10px] font-black uppercase tracking-tight">
                Express
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 border-x border-gray-100 px-2 text-center">
              <ShieldCheck className="h-5 w-5 text-yellow-600" />
              <p className="text-[10px] font-black uppercase tracking-tight">
                Global Care
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <RotateCcw className="h-5 w-5 text-yellow-600" />
              <p className="text-[10px] font-black uppercase tracking-tight">
                Returns
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-24 border-t border-gray-100 pt-16">
        <h2 className="mb-10 text-2xl font-black uppercase tracking-tight text-gray-900">
          Technical <span className="text-yellow-500">Data</span>
        </h2>
        <div className="grid grid-cols-1 gap-x-16 gap-y-2 md:grid-cols-2">
          {specs.map((spec) => (
            <div
              key={spec.label}
              className="flex justify-between border-b border-gray-50 py-5"
            >
              <span className="text-sm font-bold uppercase tracking-wide text-gray-400">
                {spec.label}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {spec.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {similarProducts.length > 0 && (
        <section className="mt-32">
          <div className="mb-12 flex items-end justify-between border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">
              Similar <span className="text-yellow-500">Innovation</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {similarProducts.map((item) => (
              <ProductCard key={item.id} product={item} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
