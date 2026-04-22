import Link from "next/link";
import { Globe, Search, Shield } from "lucide-react";

import { CartIconLink } from "@/components/layout/cart-icon-link";
import { getLocaleOption } from "@/lib/locales";

export const Header = ({ locale }: { locale: string }) => {
  const localeOption = getLocaleOption(locale);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center">
          <Link
            href={`/${locale}`}
            className="text-xl font-black tracking-tighter text-yellow-500 transition-all hover:opacity-80"
            aria-label="Aman mobile home"
          >
            AMAN<span className="text-black">MOBILE</span>
          </Link>
        </div>

        <div className="hidden flex-[2] px-8 md:block">
          <form action={`/${locale}/search`} method="get" className="relative">
            <label htmlFor="desktop-search" className="sr-only">
              Search products
            </label>
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              id="desktop-search"
              type="search"
              name="q"
              autoComplete="off"
              placeholder="Search premium electronics..."
              className="w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-yellow-500/20"
            />
          </form>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
          <Link
            href={`/${locale}/settings/language`}
            prefetch={false}
            className="hidden items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-yellow-500 lg:flex"
            aria-label="Language settings"
          >
            <Globe className="h-4 w-4" />
            {localeOption.shortLabel}
          </Link>

          <Link
            href={`/${locale}/admin`}
            className="p-2 text-gray-600 transition-colors hover:text-yellow-500"
            title="Admin Dashboard"
          >
            <Shield className="h-5 w-5" />
          </Link>

          <CartIconLink locale={locale} />
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <form action={`/${locale}/search`} method="get" className="relative">
          <label htmlFor="mobile-search-input" className="sr-only">
            Search products
          </label>
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="mobile-search-input"
            type="search"
            name="q"
            autoComplete="off"
            placeholder="Search..."
            className="w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-yellow-500/20"
          />
        </form>
      </div>
    </header>
  );
};
