export interface CPOProduct {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  handle: string;
  thumbnail?: string;
  images?: string[];
  collection_id?: string;
  status?: string;
  is_certified_pre_owned?: boolean;
  battery_health?: number;
  grading_data?: string;
  airport_delivery_available?: boolean;
  metadata: Record<string, unknown> | null;
  variants: {
    id?: string;
    title?: string;
    inventory_quantity?: number;
    prices: {
      amount: number;
      currency_code?: string;
    }[];
  }[];
}
