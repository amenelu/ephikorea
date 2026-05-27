import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    const settings = await db
      .prepare("select count(*) as count from settings")
      .get<{ count: number }>();
    const products = await db
      .prepare("select count(*) as count from products where deleted_at is null")
      .get<{ count: number }>();

    return NextResponse.json({
      ok: true,
      settings: settings?.count ?? 0,
      products: products?.count ?? 0,
    });
  } catch (error) {
    console.error("Health check failed.", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown health check error",
      },
      { status: 500 },
    );
  }
}
