import type { Product } from "@medusajs/medusa";

export interface CPOProduct extends Omit<Product, "variants"> {
  is_certified_pre_owned?: boolean;
  battery_health?: number;
  grading_data?: string;
  airport_delivery_available?: boolean;
  metadata: Record<string, unknown> | null;

  variants: {
    id?: string;
    prices: {
      amount: number;
      currency_code?: string;
    }[];
  }[];
}
