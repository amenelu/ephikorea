"use client";

import { useEffect } from "react";

import { clearStoredCart } from "@/lib/local-cart";

export function OrderSuccessHandler({ shouldClear }: { shouldClear: boolean }) {
  useEffect(() => {
    if (!shouldClear || typeof window === "undefined") {
      return;
    }

    clearStoredCart();

    const url = new URL(window.location.href);
    url.searchParams.delete("order");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [shouldClear]);

  return null;
}
