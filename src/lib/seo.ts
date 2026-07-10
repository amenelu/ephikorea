import type { Metadata } from "next";

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale,
} from "@/lib/locales";

export const SITE_NAME = "Aman Mobiles";
export const SITE_DESCRIPTION =
  "Shop new and certified pre-owned phones, audio, computing, and more -- every item checked and graded before it ships.";

export function getSiteUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3001";

  try {
    return new URL(rawUrl);
  } catch {
    return new URL("http://localhost:3001");
  }
}

export function absoluteUrl(pathname = "/") {
  return new URL(pathname, getSiteUrl()).toString();
}

export function publicPath(locale: string, pathname = "") {
  const supportedLocale = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return `/${supportedLocale}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function localizedAlternates(pathname = "") {
  return Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [
      locale,
      absoluteUrl(publicPath(locale, pathname)),
    ]),
  );
}

export function buildPageMetadata({
  locale,
  pathname = "",
  title,
  description = SITE_DESCRIPTION,
  image,
  noIndex = false,
}: {
  locale: string;
  pathname?: string;
  title: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const path = publicPath(locale, pathname);
  const url = absoluteUrl(path);
  const images = image ? [absoluteUrl(image)] : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: localizedAlternates(pathname),
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      images,
      locale,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images,
    },
  };
}

export function jsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
