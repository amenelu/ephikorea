import { LanguageSwitcher } from "@/components/settings/language-switcher";
import { getTranslator } from "@/lib/translations";

export default function LanguageSettingsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = getTranslator(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-600">
        {t("language.eyebrow")}
      </p>
      <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-gray-900 sm:mt-4 sm:text-4xl">
        {t("language.title")}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:mt-6 sm:text-lg sm:leading-8">
        {t("language.description")}
      </p>

      <LanguageSwitcher locale={locale} />
    </div>
  );
}
