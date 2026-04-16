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
