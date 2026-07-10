export function isLikelyImageUrl(url?: string | null) {
  if (!url) {
    return false;
  }

  if (url.startsWith("data:image/") || url.startsWith("/")) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return (
      /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(parsed.pathname) ||
      ["imgs.search.brave.com", "images.samsung.com"].includes(parsed.hostname)
    );
  } catch {
    return false;
  }
}

export function canUseNextImage(url?: string | null) {
  if (!url) {
    return false;
  }

  if (url.startsWith("/media/") || url.startsWith("/uploads/")) {
    return false;
  }

  if (url.startsWith("/")) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return ["images.unsplash.com", "localhost"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

export function getProductImageUrls(product: {
  thumbnail?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const rawImages = Array.isArray(product.metadata?.product_images)
    ? product.metadata.product_images
    : [];
  const urls = [
    product.thumbnail,
    ...rawImages.filter((image): image is string => typeof image === "string"),
  ];
  const seen = new Set<string>();

  return urls
    .map((url) => url?.trim())
    .filter((url): url is string => Boolean(url) && isLikelyImageUrl(url))
    .filter((url) => {
      if (seen.has(url)) {
        return false;
      }

      seen.add(url);
      return true;
    });
}

export function getProductCollectionId(metadata?: Record<string, unknown> | null) {
  const collectionId = metadata?.collection_id;

  return typeof collectionId === "string" ? collectionId : undefined;
}
