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
import { canUseNextImage, isLikelyImageUrl } from "@/lib/media";
import {
  buildBuyerFacingSpecSections,
  buildProductSpecSheet,
  fetchReferencePreviewImage,
  fetchReferenceSpecSections,
  fetchReferenceSpecs,
  getEditableProductFacts,
  getProductReferenceUrl,
  getStoredReferenceSpecSections,
  getStoredReferenceSpecs,
} from "@/lib/product-specs";
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
  const referenceUrl = getProductReferenceUrl(product.metadata);
  const storedReferenceSpecs = getStoredReferenceSpecs(product.metadata);
  const storedReferenceSections = getStoredReferenceSpecSections(product.metadata);
  const [referenceSpecs, referenceSections, referencePreviewImage] = await Promise.all([
    fetchReferenceSpecs(referenceUrl),
    fetchReferenceSpecSections(referenceUrl),
    fetchReferencePreviewImage(referenceUrl),
  ]);
  const displayImageUrl =
    product.thumbnail && isLikelyImageUrl(product.thumbnail)
      ? product.thumbnail
      : referencePreviewImage;

  const specs = buildProductSpecSheet(product, referenceSpecs);
  const specSections = buildBuyerFacingSpecSections(product, referenceSections, referenceSpecs);
  const productPath = `/${locale}/products/${product.handle || product.id}`;
  const editableFacts = getEditableProductFacts(product.metadata);
  const listingDetails = [
    typeof product.battery_health === "number"
      ? { label: "Battery Health", value: `${product.battery_health}%` }
      : null,
    product.grading_data
      ? { label: "Grading", value: product.grading_data }
      : null,
    editableFacts.imei ? { label: "IMEI", value: editableFacts.imei } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;
  const hasImportedSpecs =
    storedReferenceSpecs.length > 0 ||
    referenceSpecs.length > 0 ||
    storedReferenceSections.length > 0 ||
    referenceSections.length > 0;

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
          {displayImageUrl ? (
            canUseNextImage(displayImageUrl) ? (
              <Image
                src={displayImageUrl}
                alt={product.title}
                fill
                className="object-contain p-10"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayImageUrl}
                alt={product.title}
                className="h-full w-full object-contain p-10"
              />
            )
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
            {referenceUrl ? (
              <a
                href={referenceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-sm font-bold text-yellow-600 transition-colors hover:text-yellow-700"
              >
                View original spec sheet
              </a>
            ) : null}
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
              thumbnail={
                product.thumbnail && isLikelyImageUrl(product.thumbnail)
                  ? product.thumbnail || undefined
                  : undefined
              }
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

          {listingDetails.length > 0 ? (
            <div className="mt-5 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                <h3 className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-600">
                  Listing Details
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {listingDetails.map((detail) => (
                  <div
                    key={detail.label}
                    className="grid gap-2 px-5 py-4 md:grid-cols-[140px_1fr] md:items-center"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                      {detail.label}
                    </span>
                    {detail.label === "IMEI" ? (
                      <Link
                        href={`/${locale}/imei-verifier?imei=${encodeURIComponent(detail.value)}&returnTo=${encodeURIComponent(productPath)}`}
                        className="inline-flex w-fit items-center rounded-full bg-yellow-50 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-yellow-700 transition hover:bg-yellow-100"
                      >
                        Verify IMEI: {detail.value}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-gray-900">
                        {detail.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

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
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">
            Product <span className="text-yellow-500">Spec Sheet</span>
          </h2>
          {referenceUrl ? (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              {hasImportedSpecs ? "Spec sheet imported" : "Spec sheet linked"}
            </span>
          ) : null}
        </div>
        {referenceUrl && !hasImportedSpecs ? (
          <p className="mb-6 max-w-2xl text-sm text-gray-500">
            We have the original product spec page linked for this listing, but
            the structured specs have not been imported yet. Re-save the product
            in admin to cache the latest specs from the source page.
          </p>
        ) : null}
        <div className="space-y-8">
          {specSections.map((section) => (
            <div
              key={section.title}
              className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-700">
                  {section.title}
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {section.specs.map((spec) => (
                  <div
                    key={`${section.title}-${spec.label}`}
                    className="grid gap-2 px-6 py-4 md:grid-cols-[240px_1fr] md:items-start"
                  >
                    <span className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">
                      {spec.label}
                    </span>
                    <span className="text-sm font-semibold leading-relaxed text-gray-900">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {specSections.length === 0 ? (
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
          ) : null}
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
