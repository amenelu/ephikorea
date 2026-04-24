import Link from "next/link";

type InfoPageLink = {
  href: string;
  label: string;
};

type InfoPageSection = {
  title: string;
  body: string;
};

interface InfoPageProps {
  locale: string;
  eyebrow: string;
  title: string;
  description: string;
  highlights?: string[];
  sections?: InfoPageSection[];
  primaryLink?: InfoPageLink;
  secondaryLink?: InfoPageLink;
}

export function InfoPage({
  locale,
  eyebrow,
  title,
  description,
  highlights = [],
  sections = [],
  primaryLink,
  secondaryLink,
}: InfoPageProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="rounded-[1.75rem] border border-gray-200 bg-[linear-gradient(135deg,_rgba(250,204,21,0.18),_rgba(255,255,255,0.96)_38%,_rgba(243,244,246,0.95))] p-5 shadow-[0_25px_80px_rgba(15,23,42,0.06)] sm:rounded-[2rem] sm:p-10 lg:p-12">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-600">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-black uppercase tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
          {description}
        </p>

        {highlights.length ? (
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 text-sm font-semibold text-gray-700 backdrop-blur"
              >
                {highlight}
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
          <Link
            href={primaryLink?.href || `/${locale}/products`}
            prefetch={false}
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            {primaryLink?.label || "Browse products"}
          </Link>
          <Link
            href={secondaryLink?.href || `/${locale}/cart`}
            prefetch={false}
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-50"
          >
            {secondaryLink?.label || "Start checkout"}
          </Link>
        </div>
      </div>

      {sections.length ? (
        <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3 md:gap-6">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[1.25rem] border border-gray-200 bg-white p-5 shadow-sm sm:rounded-[1.5rem] sm:p-6"
            >
              <h2 className="text-base font-black uppercase tracking-wide text-gray-900 sm:text-lg">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
