"use client";

import React, { useState } from "react";
import { useCart, useCreateCart, useCreateLineItem } from "medusa-react";
import { ShoppingBag } from "lucide-react";

interface AddToCartButtonProps {
  variantId: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ variantId }) => {
  const { cart, setCart } = useCart();
  const createCart = useCreateCart();
  const addLineItem = useCreateLineItem(cart?.id as string);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (!variantId) return;
    setIsAdding(true);

    // If no cart exists, create one with the item included
    if (!cart?.id) {
      createCart.mutate(
        {
          items: [
            {
              variant_id: variantId,
              quantity: 1,
            },
          ],
        },
        {
          onSuccess: ({ cart }) => {
            setCart(cart);
            setIsAdding(false);
          },
          onError: (error) => {
            console.error("Failed to create cart:", error);
            setIsAdding(false);
          },
        },
      );
    } else {
      // If cart already exists, simply add the line item
      addLineItem.mutate(
        {
          variant_id: variantId,
          quantity: 1,
        },
        {
          onSuccess: () => {
            setIsAdding(false);
          },
          onError: (error) => {
            console.error("Failed to add item to cart:", error);
            setIsAdding(false);
          },
        },
      );
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-black py-5 text-base font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98] shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ShoppingBag className="h-5 w-5 text-yellow-500" />
      {isAdding ? "Adding..." : "Add to Shopping Bag"}
    </button>
  );
};

export default AddToCartButton;
