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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link
        href={returnTo}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 transition-colors hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Product
      </Link>

      <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm sm:mt-8">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start gap-3 sm:items-center">
            <ShieldCheck className="h-5 w-5 text-yellow-600" />
            <h1 className="text-lg font-black uppercase tracking-[0.14em] text-gray-900 sm:text-xl sm:tracking-[0.18em]">
              IMEI Verifier
            </h1>
          </div>
        </div>

        <div className="space-y-4 px-4 py-5 sm:space-y-5 sm:px-6 sm:py-6">
          <p className="text-sm leading-6 text-gray-500 sm:leading-relaxed">
            Use the IMEI below to verify the device details with your preferred
            IMEI checking service before purchase.
          </p>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 sm:px-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Device IMEI
            </p>
            <p className="mt-2 break-all font-mono text-base font-bold text-gray-900 sm:text-lg">
              {hasImei ? imei : "No IMEI provided for this listing."}
            </p>
          </div>

          {hasImei ? (
            <a
              href={`https://www.imei.info/?imei=${imei}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full bg-black px-5 py-3 text-center text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-gray-800 sm:w-auto sm:px-6 sm:text-sm sm:tracking-[0.18em]"
            >
              Open External IMEI Check
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
