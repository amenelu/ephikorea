import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { isAdminAuthConfigured } from "@/lib/admin-auth";

import { loginAdminAction } from "./actions";

export default function AdminLoginPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { error?: string };
}) {
  const error =
    typeof searchParams?.error === "string" ? searchParams.error : "";
  const isConfigured = isAdminAuthConfigured();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff6d6,_#f8fafc_55%,_#e5e7eb)] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full rounded-[2rem] border border-gray-200 bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-black">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400">
                Admin Access
              </p>
              <h1 className="text-2xl font-black text-gray-900">
                Sign in to continue
              </h1>
            </div>
          </div>

          {!isConfigured ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Admin auth is not configured yet. Add `ADMIN_EMAIL`,
              `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` to `.env`.
            </div>
          ) : null}

          {error ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form action={loginAdminAction} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Admin email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="username"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400 focus:bg-white"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400 focus:bg-white"
                placeholder="Enter admin password"
              />
            </div>

            <button
              type="submit"
              disabled={!isConfigured}
              className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <Link href={`/${locale}`} className="font-semibold text-gray-700">
              Back to storefront
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
