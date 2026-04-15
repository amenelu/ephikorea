import Link from "next/link";

interface InfoPageProps {
  locale: string;
  eyebrow: string;
  title: string;
  description: string;
}

export function InfoPage({
  locale,
  eyebrow,
  title,
  description,
}: InfoPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-600">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-gray-900">
        {title}
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-500">{description}</p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href={`/${locale}/products`}
          className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          Browse products
        </Link>
        <Link
          href={`/${locale}/account`}
          className="rounded-full border border-gray-200 px-6 py-3 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-50"
        >
          Contact support
        </Link>
      </div>
    </div>
  );
}
