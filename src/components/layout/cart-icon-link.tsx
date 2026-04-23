"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useLocalCart } from "@/lib/local-cart";
import { getTranslator } from "@/lib/translations";

export function CartIconLink({ locale }: { locale: string }) {
  const { items } = useLocalCart();
  const t = getTranslator(locale);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link
      href={`/${locale}/cart`}
      className="relative p-2 text-gray-600 transition-colors hover:text-yellow-500"
      aria-label={t("cart.aria", itemCount)}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-yellow-500 px-1 text-[10px] font-black leading-none text-black shadow-sm">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}
