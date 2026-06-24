import { NextResponse } from "next/server";

import { getCloudflareEnv } from "@/lib/cloudflare";

export const dynamic = "force-dynamic";

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
      cloudinaryCloudName: Boolean(env?.CLOUDINARY_CLOUD_NAME),
      cloudinaryApiKey: Boolean(env?.CLOUDINARY_API_KEY),
      cloudinaryApiSecret: Boolean(env?.CLOUDINARY_API_SECRET),
      resendApiKey: Boolean(env?.RESEND_API_KEY),
      orderNotificationFromEmail: Boolean(env?.ORDER_NOTIFICATION_FROM_EMAIL),
      adminOrderNotificationEmail: Boolean(env?.ADMIN_ORDER_NOTIFICATION_EMAIL),
      telegramBotToken: Boolean(env?.TELEGRAM_BOT_TOKEN),
      telegramChatId: Boolean(env?.TELEGRAM_CHAT_ID),
    },
    processEnv: {
      adminEmail: Boolean(process.env.ADMIN_EMAIL),
      adminPassword: Boolean(process.env.ADMIN_PASSWORD),
      adminSessionSecret: Boolean(process.env.ADMIN_SESSION_SECRET),
      cookieSecret: Boolean(process.env.COOKIE_SECRET),
      siteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
      cloudflareBindings: Boolean(process.env.CLOUDFLARE_BINDINGS),
      cloudinaryCloudName: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
      cloudinaryApiKey: Boolean(process.env.CLOUDINARY_API_KEY),
      cloudinaryApiSecret: Boolean(process.env.CLOUDINARY_API_SECRET),
      resendApiKey: Boolean(process.env.RESEND_API_KEY),
      orderNotificationFromEmail: Boolean(process.env.ORDER_NOTIFICATION_FROM_EMAIL),
      adminOrderNotificationEmail: Boolean(process.env.ADMIN_ORDER_NOTIFICATION_EMAIL),
      telegramBotToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      telegramChatId: Boolean(process.env.TELEGRAM_CHAT_ID),
    },
  });
}
