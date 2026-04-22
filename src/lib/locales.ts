export const SUPPORTED_LOCALES = ["ko", "en"] as const;
export const DEFAULT_LOCALE = "ko";
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_OPTIONS: Array<{
  code: SupportedLocale;
  label: string;
  shortLabel: string;
}> = [
  { code: "ko", label: "Korean", shortLabel: "KO" },
  { code: "en", label: "English", shortLabel: "EN" },
];

export function generateLocaleStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export function getLocaleOption(locale: string) {
  return (
    LOCALE_OPTIONS.find((option) => option.code === locale) ||
    LOCALE_OPTIONS.find((option) => option.code === DEFAULT_LOCALE)!
  );
}

export function replacePathLocale(pathname: string, locale: SupportedLocale) {
  const segments = pathname.split("/");

  if (isSupportedLocale(segments[1] || "")) {
    segments[1] = locale;
    return segments.join("/") || `/${locale}`;
  }

  return `/${locale}${pathname === "/" ? "" : pathname}`;
}
