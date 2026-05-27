import { NextResponse } from "next/server";

import { getCloudflareEnv } from "@/lib/cloudflare";

export async function GET() {
  const env = await getCloudflareEnv();

  return NextResponse.json({
    ok: true,
    cloudflareEnv: Boolean(env),
    bindings: {
      adminEmail: Boolean(env?.ADMIN_EMAIL),
      adminPassword: Boolean(env?.ADMIN_PASSWORD),
      adminSessionSecret: Boolean(env?.ADMIN_SESSION_SECRET),
      cookieSecret: Boolean(env?.COOKIE_SECRET),
      siteUrl: Boolean(env?.NEXT_PUBLIC_SITE_URL),
    },
    processEnv: {
      adminEmail: Boolean(process.env.ADMIN_EMAIL),
      adminPassword: Boolean(process.env.ADMIN_PASSWORD),
      adminSessionSecret: Boolean(process.env.ADMIN_SESSION_SECRET),
      cookieSecret: Boolean(process.env.COOKIE_SECRET),
      siteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
      cloudflareBindings: Boolean(process.env.CLOUDFLARE_BINDINGS),
    },
  });
}
