import { LanguageSwitcher } from "@/components/settings/language-switcher";

export default function LanguageSettingsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-600">
        Preferences
      </p>
      <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-gray-900">
        Language Settings
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-500">
        Choose the storefront locale you want to use across browsing and
        checkout pages.
      </p>

      <LanguageSwitcher locale={locale} />
    </div>
  );
}
