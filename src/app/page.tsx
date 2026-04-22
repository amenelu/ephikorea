import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  isSupportedLocale,
} from "@/lib/locales";

export default function RootPage() {
  const savedLocale = cookies().get(LOCALE_COOKIE_NAME)?.value;
  const locale = savedLocale && isSupportedLocale(savedLocale)
    ? savedLocale
    : DEFAULT_LOCALE;

  redirect(`/${locale}`);
}
