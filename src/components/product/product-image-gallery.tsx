"use client";

import { useState } from "react";
import Image from "next/image";

import { canUseNextImage } from "@/lib/media";

type ProductImageGalleryProps = {
  title: string;
  images: string[];
  emptyLabel: string;
};

function ProductImage({
  src,
  alt,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  className: string;
  sizes?: string;
}) {
  return canUseNextImage(src) ? (
    <Image src={src} alt={alt} fill className={className} sizes={sizes} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  );
}

export default function ProductImageGallery({
  title,
  images,
  emptyLabel,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  if (!selectedImage) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-3xl bg-gray-50 text-center text-sm font-semibold uppercase tracking-[0.3em] text-gray-300 shadow-inner">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-gray-50 shadow-inner">
        <ProductImage
          src={selectedImage}
          alt={title}
          className="h-full w-full object-contain p-5 sm:p-10"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 sm:gap-3">
          {images.map((imageUrl, index) => {
            const isSelected = imageUrl === selectedImage;

            return (
              <button
                key={imageUrl}
                type="button"
                onClick={() => setSelectedImage(imageUrl)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border bg-gray-50 transition sm:h-20 sm:w-20 ${
                  isSelected
                    ? "border-yellow-500 ring-2 ring-yellow-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                aria-label={`Show ${title} image ${index + 1}`}
              >
                <ProductImage
                  src={imageUrl}
                  alt={`${title} thumbnail ${index + 1}`}
                  className="h-full w-full object-contain p-1.5"
                  sizes="80px"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
