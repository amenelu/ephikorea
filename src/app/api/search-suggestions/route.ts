import { NextRequest, NextResponse } from "next/server";

import { getCatalogProducts } from "@/lib/catalog-data";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() || "";
  const rawLimit = Number.parseInt(request.nextUrl.searchParams.get("limit") || "5", 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 10) : 5;

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const products = await getCatalogProducts();
  const suggestions = products
    .filter((product) =>
      [product.title, product.subtitle, product.description, product.handle]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    )
    .slice(0, limit)
    .map((product) => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      subtitle: product.subtitle,
    }));

  return NextResponse.json({ suggestions });
}
