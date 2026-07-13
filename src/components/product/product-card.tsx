import React from "react";
import Image from "next/image";
import Link from "next/link";
import { canUseNextImage, isLikelyImageUrl } from "@/lib/media";
import { getSalePricing } from "@/lib/pricing";
import { CPOProduct } from "@/types/product";
import { formatLocalizedAmount } from "@/lib/utils";

export const ProductCard = ({
  product,
  locale,
}: {
  product: CPOProduct;
  locale: string;
}) => {
  const inventoryQuantity = product.variants.reduce(
    (total, variant) => total + (variant.inventory_quantity ?? 0),
    0,
  );
  const isOutOfStock = inventoryQuantity <= 0;
  const regularPrice = product.variants[0]?.prices[0]?.amount || 0;
  const currencyCode = product.variants[0]?.prices[0]?.currency_code;
  const salePricing = getSalePricing({
    regularAmount: regularPrice,
    metadata: product.metadata,
  });
  const activePrice = salePricing.saleAmount ?? regularPrice;
  const isLifestyleProduct =
    product.collection_id === "skincare" || product.collection_id === "shoes";
  const showConditionBadge = !isLifestyleProduct;

  return (
    <Link
      href={`/${locale}/products/${product.handle}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-3 transition-all hover:shadow-xl sm:p-4"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#f5f5f7]">
        {product.thumbnail && isLikelyImageUrl(product.thumbnail) ? (
          canUseNextImage(product.thumbnail) ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-105 sm:p-6"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.thumbnail}
              alt={product.title}
              className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105 sm:p-6"
            />
          )
        ) : null}
        {showConditionBadge ? (
          <div
            className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white sm:left-3 sm:top-3 sm:px-3 sm:text-[10px] ${
              product.is_certified_pre_owned ? "bg-blue-600" : "bg-emerald-600"
            }`}
          >
            {product.is_certified_pre_owned ? "Certified Pre-Owned" : "New"}
          </div>
        ) : null}
        {salePricing.discountPercent ? (
          <div className="absolute right-2.5 top-2.5 rounded-full bg-red-600 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white sm:right-3 sm:top-3 sm:px-3 sm:text-[10px]">
            {salePricing.discountPercent}% off
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1 sm:mt-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-[#1d1d1f]">
          {product.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-1">{product.subtitle}</p>

        {isOutOfStock ? (
          <p className="text-xs font-bold text-red-500">Out of stock</p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-base font-bold sm:text-lg">
              {formatLocalizedAmount(activePrice, currencyCode, locale)}
            </span>
            {typeof salePricing.saleAmount === "number" ? (
              <span className="ml-2 text-xs font-semibold text-gray-400 line-through">
                {formatLocalizedAmount(regularPrice, currencyCode, locale)}
              </span>
            ) : null}
          </div>
          {product.is_certified_pre_owned && product.battery_health && (
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-green-600 sm:text-[11px]">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              {product.battery_health}% Health
            </div>
          )}
        </div>

        {product.grading_data && (
          <p className="mt-1 text-[10px] text-gray-400 italic">
            {product.grading_data}
          </p>
        )}
      </div>
    </Link>
  );
};
