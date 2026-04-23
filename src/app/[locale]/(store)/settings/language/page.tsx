import { LanguageSwitcher } from "@/components/settings/language-switcher";
import { getTranslator } from "@/lib/translations";

export default function LanguageSettingsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = getTranslator(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-600">
        {t("language.eyebrow")}
      </p>
      <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-gray-900">
        {t("language.title")}
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-500">
        {t("language.description")}
      </p>

      <LanguageSwitcher locale={locale} />
    </div>
  );
}
