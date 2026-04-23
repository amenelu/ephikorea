import Link from "next/link";
import { getTranslator } from "@/lib/translations";

export const Footer = ({ locale }: { locale: string }) => {
  const t = getTranslator(locale);

  return (
    <footer className="mt-auto border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link
              href={`/${locale}`}
              prefetch={false}
              className="text-xl font-black tracking-tighter text-yellow-500"
            >
              {t("common.brand")}
              <span className="text-black">{t("common.brandAccent")}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
              {t("footer.description")}
            </p>
          </div>
          <div>
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
          <div>
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
          <div>
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
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 md:flex-row">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
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
