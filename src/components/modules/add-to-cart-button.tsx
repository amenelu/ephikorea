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
  currencyCode: string;
  inventoryQuantity: number;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  locale,
  variantId,
  title,
  thumbnail,
  unitPrice,
  currencyCode,
  inventoryQuantity,
}) => {
  const t = getTranslator(locale);
  const { items, addItem, updateQuantity } = useLocalCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [stockMessage, setStockMessage] = useState("");
  const checkoutHref = `/${locale || "ko"}/cart`;

  const cartItem = useMemo(
    () => items.find((item) => item.variantId === variantId),
    [items, variantId],
  );
  const quantity = cartItem?.quantity ?? 0;
  const isOutOfStock = inventoryQuantity <= 0;
  const hasReachedStockLimit = quantity >= inventoryQuantity;

  const getStockLimitMessage = () =>
    inventoryQuantity === 1
      ? "Only 1 left in inventory."
      : `Only ${inventoryQuantity} left in inventory.`;

  const showStockLimitMessage = () => {
    setStockMessage(isOutOfStock ? "Out of stock." : getStockLimitMessage());
  };

  useEffect(() => {
    if (!showConfirmation) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setShowConfirmation(false);
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [showConfirmation]);

  useEffect(() => {
    if (!stockMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setStockMessage("");
    }, 3600);

    return () => window.clearTimeout(timeout);
  }, [stockMessage]);

  const handleAddToCart = () => {
    if (!variantId) return;
    if (isOutOfStock) {
      setStockMessage("Out of stock.");
      return;
    }
    if (quantity >= inventoryQuantity) {
      showStockLimitMessage();
      return;
    }
    setIsAdding(true);
    addItem({
      variantId,
      title,
      thumbnail,
      unitPrice,
      currencyCode,
      maxInventory: inventoryQuantity,
    });
    setShowConfirmation(true);
    setIsAdding(false);
  };

  const increaseQuantity = () => {
    if (!variantId) return;

    if (isOutOfStock || hasReachedStockLimit) {
      showStockLimitMessage();
      return;
    }

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
            className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
              hasReachedStockLimit
                ? "bg-gray-200 text-gray-500"
                : "bg-black text-white hover:bg-gray-800"
            }`}
            aria-label={t("addToCart.increase")}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={increaseQuantity}
          className={`flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-sm font-bold transition-all active:scale-[0.98] ${
            hasReachedStockLimit
              ? "bg-gray-200 text-gray-500"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          <ShoppingBag className="h-4 w-4 text-yellow-500" />
          {t("addToCart.addMore")}
        </button>

        {stockMessage ? (
          <p className="rounded-2xl bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-800">
            {stockMessage}
          </p>
        ) : null}

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
    <div className="space-y-3">
      <button
        onClick={handleAddToCart}
        disabled={isAdding || isOutOfStock}
        className={`flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-base font-bold text-white shadow-2xl transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
          isOutOfStock
            ? "bg-gray-300 text-gray-600"
            : showConfirmation
              ? "bg-green-600 hover:bg-green-600"
              : "bg-black hover:bg-gray-800"
        }`}
      >
        {showConfirmation ? (
          <Check className="h-5 w-5 text-white" />
        ) : (
          <ShoppingBag className="h-5 w-5 text-yellow-500" />
        )}
        {isOutOfStock
          ? "Out of Stock"
          : isAdding
            ? t("addToCart.adding")
            : showConfirmation
              ? t("addToCart.added")
              : t("addToCart.add")}
      </button>
      {stockMessage ? (
        <p className="rounded-2xl bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-800">
          {stockMessage}
        </p>
      ) : null}
    </div>
  );
};

export default AddToCartButton;
