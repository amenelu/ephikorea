"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type LocalCartItem = {
  variantId: string;
  title: string;
  thumbnail?: string;
  unitPrice: number;
  quantity: number;
};

const STORAGE_KEY = "ephi-local-cart";
const CHANGE_EVENT = "ephi-local-cart-change";

function readCart(): LocalCartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as LocalCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: LocalCartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useLocalCart() {
  const [items, setItems] = useState<LocalCartItem[]>([]);

  const sync = useCallback(() => {
    setItems(readCart());
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, [sync]);

  const commit = useCallback((nextItems: LocalCartItem[]) => {
    setItems(nextItems);
    writeCart(nextItems);
  }, []);

  const addItem = useCallback(
    (item: Omit<LocalCartItem, "quantity">) => {
      const current = readCart();
      const existing = current.find((entry) => entry.variantId === item.variantId);

      if (existing) {
        commit(
          current.map((entry) =>
            entry.variantId === item.variantId
              ? { ...entry, quantity: entry.quantity + 1 }
              : entry,
          ),
        );
        return;
      }

      commit([...current, { ...item, quantity: 1 }]);
    },
    [commit],
  );

  const updateQuantity = useCallback(
    (variantId: string, quantity: number) => {
      const current = readCart();

      if (quantity <= 0) {
        commit(current.filter((entry) => entry.variantId !== variantId));
        return;
      }

      commit(
        current.map((entry) =>
          entry.variantId === variantId ? { ...entry, quantity } : entry,
        ),
      );
    },
    [commit],
  );

  const removeItem = useCallback(
    (variantId: string) => {
      commit(readCart().filter((entry) => entry.variantId !== variantId));
    },
    [commit],
  );

  const clearCart = useCallback(() => {
    commit([]);
  }, [commit]);

  return useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [addItem, clearCart, items, removeItem, updateQuantity],
  );
}
