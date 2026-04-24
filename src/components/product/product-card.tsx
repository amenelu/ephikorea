import React from "react";
import Image from "next/image";
import Link from "next/link";
import { canUseNextImage, isLikelyImageUrl } from "@/lib/media";
import { CPOProduct } from "@/types/medusa";
import { formatAmount } from "@/lib/utils";

export const ProductCard = ({
  product,
  locale,
}: {
  product: CPOProduct;
  locale: string;
}) => {
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
        {product.is_certified_pre_owned && (
          <div className="absolute left-2.5 top-2.5 rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white sm:left-3 sm:top-3 sm:px-3 sm:text-[10px]">
            Certified Pre-Owned
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1 sm:mt-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-[#1d1d1f]">
          {product.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-1">{product.subtitle}</p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-base font-bold sm:text-lg">
            {formatAmount(product.variants[0]?.prices[0]?.amount || 0)}
          </span>
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
