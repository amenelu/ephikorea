import Link from "next/link";

export default function SearchResultsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Search results for "{query}"
      </h1>
      <p className="mt-8 text-gray-400 italic">
        No products found matching your search criteria.
      </p>
      <div className="mt-10">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center rounded-full bg-yellow-500 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-yellow-600"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
