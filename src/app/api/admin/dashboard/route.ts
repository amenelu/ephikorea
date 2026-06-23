import { NextResponse } from "next/server";

import { getAdminDashboardData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAdminDashboardData();

    return NextResponse.json(
      {
        notifications: data.notifications,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
