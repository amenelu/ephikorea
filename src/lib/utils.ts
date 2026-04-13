import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatAmount = (amount: number, currency: string = "KRW") => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};
