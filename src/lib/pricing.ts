export type SalePricing = {
  saleAmount?: number;
  discountPercent?: number;
};

function metadataNumber(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
) {
  const value = metadata?.[key];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function saleHasExpired(metadata: Record<string, unknown> | null | undefined) {
  const value = metadata?.sale_ends_at;

  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  const normalized = value.trim();
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(normalized)
      ? `${normalized}T23:59:59.999Z`
      : normalized,
  );

  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
}

export function getSalePricing({
  regularAmount,
  metadata,
}: {
  regularAmount: number;
  metadata?: Record<string, unknown> | null;
}): SalePricing {
  if (!Number.isFinite(regularAmount) || regularAmount <= 0) {
    return {};
  }

  if (saleHasExpired(metadata)) {
    return {};
  }

  const salePercent = metadataNumber(metadata, "sale_percent");
  const salePriceAmount = metadataNumber(metadata, "sale_price_amount");
  let saleAmount: number | undefined;

  if (typeof salePercent === "number" && salePercent > 0 && salePercent < 100) {
    saleAmount = Math.max(
      0,
      Math.round(regularAmount * (1 - salePercent / 100)),
    );
  } else if (
    typeof salePriceAmount === "number" &&
    salePriceAmount > 0 &&
    salePriceAmount < regularAmount
  ) {
    saleAmount = Math.round(salePriceAmount);
  }

  if (typeof saleAmount !== "number" || saleAmount >= regularAmount) {
    return {};
  }

  return {
    saleAmount,
    discountPercent: Math.max(
      1,
      Math.round(((regularAmount - saleAmount) / regularAmount) * 100),
    ),
  };
}

export function getActiveUnitPrice({
  regularAmount,
  metadata,
}: {
  regularAmount: number;
  metadata?: Record<string, unknown> | null;
}) {
  return (
    getSalePricing({ regularAmount, metadata }).saleAmount ?? regularAmount
  );
}
