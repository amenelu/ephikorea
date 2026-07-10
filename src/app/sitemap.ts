import type { MetadataRoute } from "next";

import { getCatalogProducts } from "@/lib/catalog-data";
import { SUPPORTED_LOCALES } from "@/lib/locales";
import { absoluteUrl, publicPath } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/products",
    "/collections",
    "/collections/audio",
    "/collections/computing",
    "/collections/wearables",
    "/collections/skincare",
    "/collections/shoes",
    "/about",
    "/contact",
    "/privacy",
    "/sustainability",
    "/support/returns",
    "/support/shipping",
  ];
  const products = await getCatalogProducts();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const path of staticPaths) {
      entries.push({
        url: absoluteUrl(publicPath(locale, path)),
        lastModified: now,
        changeFrequency: path === "" || path === "/products" ? "daily" : "weekly",
        priority: path === "" ? 1 : path === "/products" ? 0.9 : 0.7,
      });
    }

    for (const product of products) {
      entries.push({
        url: absoluteUrl(publicPath(locale, `/products/${product.handle || product.id}`)),
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  }

  return entries;
}
