"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Search, Shield } from "lucide-react";

import { CartIconLink } from "@/components/layout/cart-icon-link";
import { getLocaleOption } from "@/lib/locales";
import { getTranslator } from "@/lib/translations";

export const Header = ({ locale }: { locale: string }) => {
  const localeOption = getLocaleOption(locale);
  const t = getTranslator(locale);
  const pathname = usePathname();
  const showFloatingSearch =
    !pathname?.includes(`/${locale}/products/`) || pathname === `/${locale}/products`;
  const headerOffsetClass = showFloatingSearch
    ? "h-[106px] sm:h-[124px] lg:h-16"
    : "h-14 sm:h-16";
  const searchPlaceholder =
    pathname && pathname.includes(`/${locale}/search`)
      ? t("header.searchPlaceholder")
      : t("header.mobileSearchPlaceholder");

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
                <form
                  action={`/${locale}/search`}
                  method="get"
                  className="relative"
                >
                  <label htmlFor="global-search-input-desktop" className="sr-only">
                    {t("header.searchLabel")}
                  </label>
                  <Search
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    id="global-search-input-desktop"
                    type="search"
                    name="q"
                    autoComplete="off"
                    placeholder={searchPlaceholder}
                    className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-yellow-500/20"
                  />
                </form>
              </div>
            ) : null}

            <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-3">
              <Link
                href={`/${locale}/settings/language`}
                prefetch={false}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-gray-600 transition hover:border-yellow-500 hover:text-yellow-500 sm:px-3"
                aria-label={t("header.languageSettings")}
              >
                <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {localeOption.shortLabel}
              </Link>

              <Link
                href={`/${locale}/admin`}
                className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-yellow-500"
                title={t("header.adminDashboard")}
              >
                <Shield className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </Link>

              <CartIconLink locale={locale} />
            </div>
          </div>
        </div>

        {showFloatingSearch ? (
          <div className="border-b border-gray-100/80 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-md sm:px-6 lg:hidden">
            <div className="mx-auto max-w-7xl">
              <form
                action={`/${locale}/search`}
                method="get"
                className="relative mx-auto max-w-2xl rounded-full border border-gray-200 bg-white shadow-lg shadow-black/5"
              >
                <label htmlFor="global-search-input" className="sr-only">
                  {t("header.searchLabel")}
                </label>
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="global-search-input"
                  type="search"
                  name="q"
                  autoComplete="off"
                  placeholder={searchPlaceholder}
                  className="w-full rounded-full bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-yellow-500/20 sm:py-3"
                />
              </form>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
};
