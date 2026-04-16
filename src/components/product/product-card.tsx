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
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-4 transition-all hover:shadow-xl"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#f5f5f7]">
        {product.thumbnail && isLikelyImageUrl(product.thumbnail) ? (
          canUseNextImage(product.thumbnail) ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.thumbnail}
              alt={product.title}
              className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
            />
          )
        ) : null}
        {product.is_certified_pre_owned && (
          <div className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Certified Pre-Owned
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-[#1d1d1f]">
          {product.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-1">{product.subtitle}</p>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold">
            {formatAmount(product.variants[0]?.prices[0]?.amount || 0)}
          </span>
          {product.is_certified_pre_owned && product.battery_health && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-green-600">
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
