import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

function formatImei(value: string) {
  return value.replace(/\D/g, "").slice(0, 16);
}

export default function ImeiVerifierPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { imei?: string; returnTo?: string };
}) {
  const imei = formatImei(String(searchParams.imei || ""));
  const hasImei = imei.length >= 14;
  const returnTo =
    typeof searchParams.returnTo === "string" &&
    searchParams.returnTo.startsWith(`/${locale}/products/`)
      ? searchParams.returnTo
      : `/${locale}/products`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={returnTo}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 transition-colors hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Product
      </Link>

      <div className="mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-yellow-600" />
            <h1 className="text-xl font-black uppercase tracking-[0.18em] text-gray-900">
              IMEI Verifier
            </h1>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <p className="text-sm leading-relaxed text-gray-500">
            Use the IMEI below to verify the device details with your preferred
            IMEI checking service before purchase.
          </p>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Device IMEI
            </p>
            <p className="mt-2 break-all font-mono text-lg font-bold text-gray-900">
              {hasImei ? imei : "No IMEI provided for this listing."}
            </p>
          </div>

          {hasImei ? (
            <a
              href={`https://www.imei.info/?imei=${imei}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-gray-800"
            >
              Open External IMEI Check
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
