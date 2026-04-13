import React from "react";
import Image from "next/image";
import { medusaClient } from "@/lib/medusa";
import { formatAmount } from "@/lib/utils";
import { CPOProduct } from "@/types/medusa";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params: { handle },
}: {
  params: { handle: string };
}) {
  const { products } = await medusaClient.products.list({
    handle,
    expand: "variants,variants.prices,images",
  });

  const product = products[0] as unknown as CPOProduct;

  if (!product) {
    notFound();
  }

  const price = product.variants[0]?.prices[0]?.amount || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-white shadow-sm">
          {product.thumbnail && (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-contain p-12"
            />
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          {product.is_certified_pre_owned && (
            <span className="mb-4 w-fit rounded-full bg-blue-50 px-4 py-1 text-xs font-bold text-blue-600 uppercase tracking-wide">
              Verified Pre-Owned
            </span>
          )}
          <h1 className="text-4xl font-bold text-gray-900">{product.title}</h1>
          <p className="mt-2 text-xl text-gray-500">{product.subtitle}</p>

          <div className="mt-8 border-t border-gray-100 pt-8">
            <span className="text-3xl font-black text-blue-600">
              {formatAmount(price)}
            </span>
          </div>

          <div className="mt-10 flex flex-col gap-4">
            <button className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-[0.98]">
              Add to Cart
            </button>
            <p className="text-center text-xs text-gray-400">
              Free airport node delivery for verified crew members.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
