"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { CartIconLink } from "@/components/layout/cart-icon-link";
import { GlobalSearch } from "@/components/layout/global-search";
import {
  LOCALE_COOKIE_NAME,
  type SupportedLocale,
  replacePathLocale,
} from "@/lib/locales";
import { getTranslator } from "@/lib/translations";

export const Header = ({ locale }: { locale: string }) => {
  const t = getTranslator(locale);
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = locale === "en" ? "en" : "ko";
  const nextLocale: SupportedLocale = currentLocale === "ko" ? "en" : "ko";
  const showFloatingSearch =
    !pathname?.includes(`/${locale}/products/`) || pathname === `/${locale}/products`;
  const headerOffsetClass = showFloatingSearch
    ? "h-[106px] sm:h-[124px] lg:h-16"
    : "h-14 sm:h-16";
  const searchPlaceholder =
    pathname && pathname.includes(`/${locale}/search`)
      ? t("header.searchPlaceholder")
      : t("header.mobileSearchPlaceholder");
  const switchLanguageLabel =
    currentLocale === "ko" ? t("language.en") : t("language.ko");

  const handleLanguageToggle = () => {
    const queryString = window.location.search;
    const nextPath = replacePathLocale(pathname || `/${currentLocale}`, nextLocale);
    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.push(`${nextPath}${queryString}`);
    router.refresh();
  };

  return (
    <>
      <div className={headerOffsetClass} aria-hidden="true" />
      <header className="fixed inset-x-0 top-0 z-50 w-full">
        <div className="border-b border-gray-100 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1 items-center">
              <Link
                href={`/${locale}`}
                className="inline-flex max-w-full items-center text-lg font-black tracking-tighter text-yellow-500 transition-all hover:opacity-80 sm:text-xl"
                aria-label="Aman mobile home"
              >
                <span className="truncate">
                  {t("common.brand")}
                  <span className="text-black">{t("common.brandAccent")}</span>
                </span>
              </Link>
            </div>

            {showFloatingSearch ? (
              <div className="hidden lg:block lg:w-full lg:max-w-2xl lg:flex-[1.2]">
                <GlobalSearch
                  locale={locale}
                  inputId="global-search-input-desktop"
                  placeholder={searchPlaceholder}
                  className="relative"
                  inputClassName="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-base outline-none transition-all focus:ring-2 focus:ring-yellow-500/20 sm:text-sm"
                />
              </div>
            ) : null}

            <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-3">
              <button
                type="button"
                onClick={handleLanguageToggle}
                className="group inline-flex h-9 items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1 text-[11px] font-black uppercase text-gray-600 transition hover:border-yellow-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 sm:h-10 sm:px-2.5"
                aria-label={`${t("header.languageSettings")}: ${switchLanguageLabel}`}
                aria-pressed={currentLocale === "en"}
                title={switchLanguageLabel}
              >
                <span className="min-w-5 text-center text-yellow-600">KO</span>
                <span
                  className={`flex h-5 w-9 shrink-0 items-center rounded-full bg-gray-200 px-0.5 transition group-hover:bg-yellow-100 ${
                    currentLocale === "en" ? "justify-end" : "justify-start"
                  }`}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-white shadow-sm ring-1 ring-gray-300 transition ${
                      currentLocale === "en" ? "ring-yellow-500" : ""
                    }`}
                  />
                </span>
                <span className="min-w-5 text-center text-gray-900">EN</span>
              </button>

              <CartIconLink locale={locale} />
            </div>
          </div>
        </div>

        {showFloatingSearch ? (
          <div className="border-b border-gray-100/80 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-md sm:px-6 lg:hidden">
            <div className="mx-auto max-w-7xl">
              <GlobalSearch
                locale={locale}
                inputId="global-search-input"
                placeholder={searchPlaceholder}
                className="relative mx-auto max-w-2xl rounded-full border border-gray-200 bg-white shadow-lg shadow-black/5"
                inputClassName="w-full rounded-full bg-transparent py-2.5 pl-10 pr-4 text-base outline-none transition-all focus:ring-2 focus:ring-yellow-500/20 sm:py-3 sm:text-sm"
              />
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
};
