import { create } from "zustand";

interface CartState {
  cartItemsCount: number;
  setCartCount: (count: number) => void;
}

export const useCartStore = create<CartState>((set) => ({
  cartItemsCount: 0,
  setCartCount: (count) => set({ cartItemsCount: count }),
}));
