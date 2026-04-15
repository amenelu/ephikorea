import Link from "next/link";

const locales = [
  { code: "ko", label: "Korean" },
  { code: "en", label: "English" },
];

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
        Choose the storefront locale you want to use across browsing, account,
        and checkout pages.
      </p>

      <div className="mt-10 grid gap-4">
        {locales.map((item) => {
          const isActive = item.code === locale;

          return (
            <Link
              key={item.code}
              href={`/${item.code}`}
              className={`rounded-3xl border p-6 transition-colors ${
                isActive
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-gray-900">
                    {item.label}
                  </h2>
                  <p className="text-sm text-gray-500">{item.code}</p>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-yellow-600">
                  {isActive ? "Current" : "Switch"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
