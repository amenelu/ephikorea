"use client";

import { useEffect, useTransition } from "react";

import { useLocalCart } from "@/lib/local-cart";
import { getTranslator } from "@/lib/translations";

type CartClientProps = {
  locale: string;
  status?: string;
  message?: string;
  checkoutAction: (formData: FormData) => void | Promise<void>;
  countries: Array<{
    iso_2: string;
    display_name: string;
  }>;
};

export default function CartClient({
  locale,
  status,
  message,
  checkoutAction,
  countries,
}: CartClientProps) {
  const t = getTranslator(locale);
  const { items, updateQuantity, removeItem, clearCart } = useLocalCart();
  const [isSubmitting, startTransition] = useTransition();

  useEffect(() => {
    if (status === "success") {
      clearCart();
    }
  }, [clearCart, status]);

  const cartSnapshot = JSON.stringify(
    items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    })),
  );
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900">{t("cart.checkout")}</h1>
        <p className="mt-3 text-sm text-gray-500">
          {t("cart.description")}
        </p>
      </div>

      {message ? (
        <div
          className={`mt-8 rounded-2xl border px-4 py-3 text-sm font-medium ${
            status === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      ) : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">
            {t("cart.orderSummary")}
          </h2>

          {items.length > 0 ? (
            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="rounded-2xl border border-gray-100 px-4 py-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-400">
                        ${((item.unitPrice * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="text-xs font-black uppercase tracking-widest text-red-500"
                    >
                      {t("cart.remove")}
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center rounded-full border border-gray-200">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity - 1)
                        }
                        className="px-4 py-2 text-sm font-black text-gray-700"
                      >
                        -
                      </button>
                      <span className="px-3 text-sm font-bold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity + 1)
                        }
                        className="px-4 py-2 text-sm font-black text-gray-700"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-black text-gray-900">
                      ${((item.unitPrice * item.quantity) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm font-black uppercase tracking-widest text-gray-900">
                <span>{t("cart.subtotal")}</span>
                <span>${(subtotal / 100).toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border-2 border-dashed border-gray-100 p-8 text-center text-gray-400 sm:p-16">
              {t("cart.empty")}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">
            {t("cart.deliveryDetails")}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {t("cart.deliveryDescription")}
          </p>

          <form
            action={(formData) => {
              startTransition(async () => {
                await checkoutAction(formData);
              });
            }}
            className="mt-6 space-y-4"
          >
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="cartSnapshot" value={cartSnapshot} />

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                {t("cart.fullName")}
              </span>
              <input
                type="text"
                name="name"
                required
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
                placeholder="Aman Kim"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                {t("cart.email")}
              </span>
              <input
                type="email"
                name="email"
                required
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                {t("cart.phone")}
              </span>
              <input
                type="tel"
                name="phone"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
                placeholder="+82 10 1234 5678"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                {t("cart.address1")}
              </span>
              <input
                type="text"
                name="address1"
                required
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
                placeholder="123 Gangnam-daero"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                {t("cart.address2")}
              </span>
              <input
                type="text"
                name="address2"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
                placeholder="Apartment, suite, floor"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                  {t("cart.city")}
                </span>
                <input
                  type="text"
                  name="city"
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
                  placeholder="Seoul"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                  {t("cart.province")}
                </span>
                <input
                  type="text"
                  name="province"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
                  placeholder="Seoul"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                  {t("cart.postalCode")}
                </span>
                <input
                  type="text"
                  name="postalCode"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
                  placeholder="06236"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                  {t("cart.country")}
                </span>
                <select
                  name="countryCode"
                  defaultValue="kr"
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
                >
                  {countries.map((country) => (
                    <option key={country.iso_2} value={country.iso_2}>
                      {country.display_name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="submit"
              disabled={items.length === 0 || isSubmitting}
              className="w-full rounded-full bg-black px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? t("cart.submitting") : t("cart.submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
