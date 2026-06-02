import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SUPPORTED_CURRENCIES = ["usd", "krw"] as const;
const USD_TO_KRW_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_KRW_RATE || "1350");

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export function normalizeCurrencyCode(currency?: string): SupportedCurrency {
  const normalized = currency?.trim().toLowerCase();

  return SUPPORTED_CURRENCIES.includes(normalized as SupportedCurrency)
    ? (normalized as SupportedCurrency)
    : "usd";
}

export function getLocaleCurrency(locale: string): SupportedCurrency {
  return locale === "ko" ? "krw" : "usd";
}

function amountForIntl(amount: number, currency: SupportedCurrency) {
  return currency === "usd" ? amount / 100 : amount;
}

export function convertAmount(
  amount: number,
  fromCurrency: string | undefined,
  toCurrency: string | undefined,
) {
  const from = normalizeCurrencyCode(fromCurrency);
  const to = normalizeCurrencyCode(toCurrency);

  if (from === to) {
    return Math.round(amount);
  }

  if (from === "usd" && to === "krw") {
    return Math.round((amount / 100) * USD_TO_KRW_RATE);
  }

  return Math.round((amount / USD_TO_KRW_RATE) * 100);
}

export function formatAmount(
  amount: number,
  currency: string = "usd",
  locale = "en",
) {
  const normalizedCurrency = normalizeCurrencyCode(currency);
  const intlLocale = locale === "ko" ? "ko-KR" : "en-US";

  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency: normalizedCurrency.toUpperCase(),
    maximumFractionDigits: normalizedCurrency === "krw" ? 0 : 2,
  }).format(amountForIntl(amount, normalizedCurrency));
}

export function formatLocalizedAmount(
  amount: number,
  sourceCurrency: string | undefined,
  locale: string,
) {
  const targetCurrency = getLocaleCurrency(locale);
  return formatAmount(
    convertAmount(amount, sourceCurrency, targetCurrency),
    targetCurrency,
    locale,
  );
}

export function formatAdminPriceInput(amount: number, currency: string | undefined) {
  const normalizedCurrency = normalizeCurrencyCode(currency);

  if (normalizedCurrency === "krw") {
    return String(Math.round(amount));
  }

  return (amount / 100).toFixed(2);
}
