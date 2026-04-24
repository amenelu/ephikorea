import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/modules/add-to-cart-button";
import ProductDetailsPanels from "@/components/product/product-details-panels";
import { ProductCard } from "@/components/product/product-card";
import {
  getCatalogProductByIdOrHandle,
  getCatalogProductPrice,
  getSimilarCatalogProducts,
} from "@/lib/catalog-data";
import { canUseNextImage, isLikelyImageUrl } from "@/lib/media";
import {
  buildBuyerFacingSpecSections,
  buildProductSpecSheet,
  getEditableProductFacts,
  getProductReferenceUrl,
  getStoredReferenceSpecSections,
  getStoredReferenceSpecs,
} from "@/lib/product-specs";
import { getTranslator } from "@/lib/translations";
import { formatAmount } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const t = getTranslator(locale);
  const product = await getCatalogProductByIdOrHandle(id);

  if (!product) {
    notFound();
  }

  const similarProductsPromise = getSimilarCatalogProducts(product.id, 3);
  const price = getCatalogProductPrice(product);
  const primaryVariant = product.variants?.[0];
  const similarProducts = await similarProductsPromise;
  const referenceUrl = getProductReferenceUrl(product.metadata);
  const storedReferenceSpecs = getStoredReferenceSpecs(product.metadata);
  const storedReferenceSections = getStoredReferenceSpecSections(product.metadata);
  const displayImageUrl =
    product.thumbnail && isLikelyImageUrl(product.thumbnail)
      ? product.thumbnail
      : undefined;

  const hasImportedSpecs =
    storedReferenceSpecs.length > 0 || storedReferenceSections.length > 0;
  const specs = buildProductSpecSheet(product);
  const specSections = hasImportedSpecs
    ? buildBuyerFacingSpecSections(product).filter(
        (section) => section.title.toLowerCase() !== "overview",
      )
    : [];
  const productPath = `/${locale}/products/${product.handle || product.id}`;
  const editableFacts = getEditableProductFacts(product.metadata);
  const overviewDetails = [
    editableFacts.color ? { label: "Color", value: editableFacts.color } : null,
    editableFacts.storage
      ? {
          label: "Storage",
          value: /^\d+$/.test(editableFacts.storage)
            ? `${editableFacts.storage}GB`
            : editableFacts.storage,
        }
      : null,
    typeof product.battery_health === "number"
      ? { label: t("product.batteryHealth"), value: `${product.battery_health}%` }
      : null,
    product.grading_data
      ? { label: t("product.grading"), value: product.grading_data }
      : null,
    editableFacts.imei ? { label: "IMEI", value: editableFacts.imei } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;
  const primarySpecs = specs.slice(0, 6);
  const secondarySpecs = specs.slice(6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link
        href={`/${locale}/products`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-gray-400 transition-colors hover:text-black sm:mb-8 lg:text-base"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("product.back")}
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-gray-50 shadow-inner">
          {displayImageUrl ? (
            canUseNextImage(displayImageUrl) ? (
              <Image
                src={displayImageUrl}
                alt={product.title}
                fill
                className="object-contain p-5 sm:p-10"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayImageUrl}
                alt={product.title}
                className="h-full w-full object-contain p-5 sm:p-10"
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-center text-sm font-semibold uppercase tracking-[0.3em] text-gray-300">
              {t("product.noImage")}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="mb-5 sm:mb-6">
            {product.is_certified_pre_owned && (
              <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700 lg:px-4 lg:text-[11px]">
                {t("product.certified")}
              </span>
            )}
            <h1 className="mt-4 text-2xl font-black uppercase tracking-tighter text-gray-900 sm:text-4xl lg:text-6xl xl:text-[4.25rem]">
              {product.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-gray-500 sm:text-lg sm:leading-relaxed lg:text-xl lg:leading-8">
              {product.description ||
                product.subtitle ||
                t("product.noDescription")}
            </p>
            {referenceUrl ? (
              <a
                href={referenceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-sm font-bold text-yellow-600 transition-colors hover:text-yellow-700 lg:text-base"
              >
                {t("product.originalSpec")}
              </a>
            ) : null}
          </div>

          <div className="mb-6 sm:mb-8">
            <p className="text-2xl font-black text-black sm:text-3xl lg:text-4xl">
              {formatAmount(price)}
            </p>
            <p className="mt-1 text-xs italic text-gray-400 lg:text-sm">
              {t("product.shippingNote")}
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
              {t("product.variantUnavailable")}
            </button>
          )}

          {overviewDetails.length > 0 ? (
            <div className="mt-5 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                <h3 className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-600 lg:text-xs">
                  Overview
                </h3>
              </div>
              <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                {overviewDetails.map((detail) => (
                  <div key={detail.label} className="px-5 py-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 lg:text-[11px]">
                      {detail.label}
                    </p>
                    {detail.label === "IMEI" ? (
                      <Link
                        href={`/${locale}/imei-verifier?imei=${encodeURIComponent(detail.value)}&returnTo=${encodeURIComponent(productPath)}`}
                        className="mt-2 inline-flex w-fit max-w-full items-center break-all rounded-full bg-yellow-50 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-yellow-700 transition hover:bg-yellow-100 lg:text-sm"
                      >
                        {detail.value}
                      </Link>
                    ) : (
                      <p className="mt-2 text-sm font-semibold leading-6 text-gray-900 lg:text-base lg:leading-7">
                        {detail.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

        </div>
      </div>

      <ProductDetailsPanels
        primarySpecsTitle={t("product.specSheet")}
        importedBadge={
          referenceUrl
            ? hasImportedSpecs
              ? t("product.specImported")
              : t("product.specLinked")
            : undefined
        }
        originalSpecLabel={referenceUrl ? t("product.originalSpec") : undefined}
        originalSpecHref={referenceUrl || undefined}
        primarySpecs={primarySpecs}
        secondarySpecs={secondarySpecs}
        specSections={specSections}
      />

      {similarProducts.length > 0 && (
        <section className="mt-20 sm:mt-32">
          <div className="mb-8 flex items-end justify-between border-b border-gray-100 pb-6 sm:mb-12 sm:pb-8">
            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
              {t("product.similar")}{" "}
              <span className="text-yellow-500">{t("product.similarAccent")}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-8 lg:gap-10">
            {similarProducts.map((item) => (
              <ProductCard key={item.id} product={item} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
