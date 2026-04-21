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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center px-6 border-b border-gray-100">
          <Link
            href={`/${locale}`}
            className="text-xl font-black tracking-tighter text-yellow-500"
          >
            STORE<span className="text-black">ADMIN</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50 hover:text-black"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-gray-200 bg-white px-8 flex items-center justify-between">
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
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
