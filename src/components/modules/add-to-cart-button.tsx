"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useLocalCart } from "@/lib/local-cart";
import { getTranslator } from "@/lib/translations";

interface AddToCartButtonProps {
  locale: string;
  variantId: string;
  title: string;
  thumbnail?: string;
  unitPrice: number;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  locale,
  variantId,
  title,
  thumbnail,
  unitPrice,
}) => {
  const t = getTranslator(locale);
  const { items, addItem, updateQuantity } = useLocalCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const checkoutHref = `/${locale || "ko"}/cart`;

  const cartItem = useMemo(
    () => items.find((item) => item.variantId === variantId),
    [items, variantId],
  );
  const quantity = cartItem?.quantity ?? 0;

  useEffect(() => {
    if (!showConfirmation) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setShowConfirmation(false);
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [showConfirmation]);

  const handleAddToCart = () => {
    if (!variantId) return;
    setIsAdding(true);
    addItem({
      variantId,
      title,
      thumbnail,
      unitPrice,
    });
    setShowConfirmation(true);
    setIsAdding(false);
  };

  const increaseQuantity = () => {
    if (!variantId) return;

    if (quantity === 0) {
      handleAddToCart();
      return;
    }

    updateQuantity(variantId, quantity + 1);
    setShowConfirmation(true);
  };

  const decreaseQuantity = () => {
    if (!variantId || quantity === 0) return;
    updateQuantity(variantId, quantity - 1);
  };

  if (quantity > 0) {
    return (
      <div className="space-y-3">
        <div
          className={`flex items-center justify-between rounded-2xl border px-4 py-4 shadow-2xl transition-all ${
            showConfirmation
              ? "border-yellow-300 bg-yellow-50 scale-[1.01]"
              : "border-gray-200 bg-white"
          }`}
        >
          <button
            type="button"
            onClick={decreaseQuantity}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:bg-gray-50"
            aria-label={t("addToCart.decrease")}
          >
            <Minus className="h-4 w-4" />
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-black text-gray-900">
                {quantity}
              </span>
              {showConfirmation ? (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white animate-[ping_0.8s_ease-out_1]">
                  <Check className="h-3.5 w-3.5" />
                </span>
              ) : null}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              {t("addToCart.inBag")}
            </p>
          </div>

          <button
            type="button"
            onClick={increaseQuantity}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition hover:bg-gray-800"
            aria-label={t("addToCart.increase")}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={increaseQuantity}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-black py-4 text-sm font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
        >
          <ShoppingBag className="h-4 w-4 text-yellow-500" />
          {t("addToCart.addMore")}
        </button>

        <a
          href={checkoutHref}
          className="flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white py-4 text-sm font-black uppercase tracking-widest text-gray-900 transition hover:bg-gray-50"
        >
          {t("addToCart.checkout")}
        </a>
      </div>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-base font-bold text-white transition-all active:scale-[0.98] shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed ${
        showConfirmation
          ? "bg-green-600 hover:bg-green-600"
          : "bg-black hover:bg-gray-800"
      }`}
    >
      {showConfirmation ? (
        <Check className="h-5 w-5 text-white" />
      ) : (
        <ShoppingBag className="h-5 w-5 text-yellow-500" />
      )}
      {isAdding
        ? t("addToCart.adding")
        : showConfirmation
          ? t("addToCart.added")
          : t("addToCart.add")}
    </button>
  );
};

export default AddToCartButton;
