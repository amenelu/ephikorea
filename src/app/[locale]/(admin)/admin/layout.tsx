import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
} from "lucide-react";

import { requireAdminPageAccess } from "@/lib/admin-auth";
import { logoutAdminAction } from "@/app/[locale]/admin/login/actions";

export default async function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  await requireAdminPageAccess(locale);

  const navItems = [
    { label: "Dashboard", href: `/${locale}/admin`, icon: LayoutDashboard },
    { label: "Products", href: `/${locale}/admin/products`, icon: Package },
    { label: "Orders", href: `/${locale}/admin/orders`, icon: ShoppingCart },
    { label: "Customers", href: `/${locale}/admin/customers`, icon: Users },
    { label: "Settings", href: `/${locale}/admin/settings`, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <aside className="border-b border-gray-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex h-14 items-center justify-between border-b border-gray-100 px-4 sm:h-16 sm:px-6 lg:justify-start">
          <Link
            href={`/${locale}`}
            className="text-lg font-black tracking-tighter text-yellow-500 sm:text-xl"
          >
            STORE<span className="text-black">ADMIN</span>
          </Link>
          <form action={logoutAdminAction} className="lg:hidden">
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="rounded-full border border-gray-200 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 transition hover:border-gray-300 hover:text-gray-900"
            >
              Sign out
            </button>
          </form>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 py-2.5 lg:block lg:space-y-1 lg:overflow-visible lg:p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-gray-500 transition-colors hover:bg-gray-50 hover:text-black sm:text-sm sm:tracking-normal lg:gap-3 lg:px-4 lg:py-3 lg:normal-case"
            >
              <item.icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="hidden h-16 items-center justify-between border-b border-gray-200 bg-white px-8 lg:flex">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">
            Management Console
          </h2>
          <form action={logoutAdminAction}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="rounded-full border border-gray-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-gray-500 transition hover:border-gray-300 hover:text-gray-900"
            >
              Sign out
            </button>
          </form>
        </header>
        <div className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
