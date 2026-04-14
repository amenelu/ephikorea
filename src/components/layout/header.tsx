"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User, Globe, Shield } from "lucide-react";
import { useCart } from "medusa-react";

export const Header = ({ locale }: { locale: string }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { cart } = useCart();
  const cartItemsCount =
    cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(
      `/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`,
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex flex-1 items-center">
          <Link
            href={`/${locale}`}
            className="text-xl font-black tracking-tighter text-yellow-500 transition-all hover:opacity-80"
            aria-label="Store Home"
          >
            STORE<span className="text-black">FRONT</span>
          </Link>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden flex-[2] px-8 md:block">
          <form onSubmit={handleSearch} className="relative">
            <label htmlFor="desktop-search" className="sr-only">
              Search products
            </label>
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              id="desktop-search"
              type="search"
              name="q"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search premium electronics..."
              className="w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-yellow-500/20"
            />
          </form>
        </div>

        {/* Actions */}
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
          <Link
            href={`/${locale}/settings/language`}
            className="hidden items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-yellow-500 lg:flex"
            aria-label="Language settings"
          >
            <Globe className="h-4 w-4" />
            EN
          </Link>

          <Link
            href={`/${locale}/admin`}
            className="p-2 text-gray-600 transition-colors hover:text-yellow-500"
            title="Admin Dashboard"
          >
            <Shield className="h-5 w-5" />
          </Link>

          <Link
            href={`/${locale}/account`}
            className="p-2 text-gray-600 transition-colors hover:text-yellow-500"
          >
            <User className="h-5 w-5" />
          </Link>

          <Link
            href={`/${locale}/cart`}
            className="relative p-2 text-gray-600 transition-colors hover:text-yellow-500"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-yellow-500 px-1 text-[10px] font-bold text-white">
                {cartItemsCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Search - Visible only on small screens */}
      <div className="px-4 pb-3 md:hidden">
        <form onSubmit={handleSearch} className="relative">
          <label htmlFor="mobile-search-input" className="sr-only">
            Search products
          </label>
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="mobile-search-input"
            type="search"
            name="q"
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-yellow-500/20"
          />
        </form>
      </div>
    </header>
  );
};
