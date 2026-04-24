import Link from "next/link";
import { getTranslator } from "@/lib/translations";

export const Footer = ({ locale }: { locale: string }) => {
  const t = getTranslator(locale);

  return (
    <footer className="mt-auto border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,0.75fr))] lg:gap-x-10">
          <div className="col-span-2 lg:col-span-1">
            <Link
              href={`/${locale}`}
              prefetch={false}
              className="text-lg font-black tracking-tighter text-yellow-500 sm:text-xl"
            >
              {t("common.brand")}
              <span className="text-black">{t("common.brandAccent")}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-7 text-gray-500">
              {t("footer.description")}
            </p>
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">
              {t("footer.collections")}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={`/${locale}/collections/audio`}
                  prefetch={false}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  {t("footer.audio")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/collections/computing`}
                  prefetch={false}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  {t("footer.computing")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/collections/wearables`}
                  prefetch={false}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  {t("footer.wearables")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">
              {t("footer.support")}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={`/${locale}/support/shipping`}
                  prefetch={false}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  {t("footer.shipping")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/support/returns`}
                  prefetch={false}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  {t("footer.returns")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  prefetch={false}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  {t("footer.contact")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2 min-w-0 sm:col-span-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">
              {t("footer.company")}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={`/${locale}/about`}
                  prefetch={false}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/sustainability`}
                  prefetch={false}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  {t("footer.sustainability")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  prefetch={false}
                  className="text-sm text-gray-500 transition-colors hover:text-yellow-600"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
            {t("footer.copyright", new Date().getFullYear())}
          </p>
          <div className="flex gap-6">
            <span className="text-[10px] font-black uppercase tracking-tighter text-gray-300">
              SEOUL / GLOBAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
