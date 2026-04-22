import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  SUPPORTED_LOCALES,
  isSupportedLocale,
} from "@/lib/locales";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname is missing a locale
  const pathnameIsMissingLocale = SUPPORTED_LOCALES.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );

  if (pathnameIsMissingLocale) {
    const savedLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
    const locale = savedLocale && isSupportedLocale(savedLocale)
      ? savedLocale
      : DEFAULT_LOCALE;

    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url),
    );
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
