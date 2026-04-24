"use client";

import { usePathname, useRouter } from "next/navigation";

import {
  LOCALE_COOKIE_NAME,
  LOCALE_OPTIONS,
  type SupportedLocale,
  replacePathLocale,
} from "@/lib/locales";
import { getTranslator } from "@/lib/translations";

export function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = getTranslator(locale);

  const handleLocaleChange = (nextLocale: SupportedLocale) => {
    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.push(replacePathLocale(pathname, nextLocale));
    router.refresh();
  };

  return (
    <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4">
      {LOCALE_OPTIONS.map((item) => {
        const isActive = item.code === locale;

        return (
          <button
            key={item.code}
            type="button"
            onClick={() => handleLocaleChange(item.code)}
            className={`rounded-3xl border p-4 text-left transition-colors sm:p-6 ${
              isActive
                ? "border-yellow-500 bg-yellow-50"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div>
                <h2 className="text-base font-black text-gray-900 sm:text-lg">
                  {t(item.code === "ko" ? "language.ko" : "language.en")}
                </h2>
                <p className="text-sm text-gray-500">{item.code}</p>
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-600 sm:text-xs sm:tracking-[0.2em]">
                {isActive ? t("common.current") : t("common.switch")}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
