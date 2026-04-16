export type ProductProfile =
  | "phone"
  | "laptop"
  | "watch"
  | "vr"
  | "generic";

export type EditableProductFacts = {
  color?: string;
  storage?: string;
};

export type ProductSpec = {
  label: string;
  value: string;
};

type ProductSpecSource = {
  title?: string;
  handle?: string | null;
  collection_id?: string | null;
  battery_health?: number;
  grading_data?: string;
  is_certified_pre_owned?: boolean;
  metadata?: Record<string, unknown> | null;
};

function asObject(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function normalizeText(value: string | null | undefined) {
  return value?.toLowerCase().trim() || "";
}

export function inferProductProfile(source: {
  title?: string;
  handle?: string | null;
  collection_id?: string | null;
}) {
  const haystack = [
    normalizeText(source.title),
    normalizeText(source.handle),
    normalizeText(source.collection_id || undefined),
  ].join(" ");

  if (/(phone|mobile|iphone|galaxy|pixel)/.test(haystack)) {
    return "phone" as const;
  }

  if (/(laptop|macbook|notebook|ultrabook)/.test(haystack)) {
    return "laptop" as const;
  }

  if (/(watch|wearable)/.test(haystack)) {
    return "watch" as const;
  }

  if (/(vr|vision|headset)/.test(haystack)) {
    return "vr" as const;
  }

  return "generic" as const;
}

export function getEditableProductFacts(
  metadata?: Record<string, unknown> | null,
) {
  const specFacts = asObject(metadata?.spec_facts);

  return {
    color: asString(specFacts?.color),
    storage: asString(specFacts?.storage),
  } satisfies EditableProductFacts;
}

export function buildProductMetadata(
  existingMetadata: Record<string, unknown> | undefined,
  source: {
    title?: string;
    handle?: string;
    collection_id?: string | null;
    color?: string;
    storage?: string;
  },
) {
  const profile =
    asString(existingMetadata?.product_profile) ||
    inferProductProfile(source);

  return {
    ...(existingMetadata || {}),
    product_profile: profile,
    spec_facts: {
      color: source.color?.trim() || null,
      storage: source.storage?.trim() || null,
    },
  };
}

function getProfileSpecs(profile: ProductProfile) {
  switch (profile) {
    case "phone":
      return [
        { label: "Category", value: "Smartphone" },
        { label: "Display", value: "High-resolution OLED display" },
        { label: "Connectivity", value: "5G, Wi-Fi, Bluetooth" },
        { label: "Build", value: "Premium lightweight frame" },
      ];
    case "laptop":
      return [
        { label: "Category", value: "Laptop" },
        { label: "Display", value: "High-resolution productivity display" },
        { label: "Performance", value: "Creator and multitasking focused" },
        { label: "Storage Type", value: "Solid-state storage" },
      ];
    case "watch":
      return [
        { label: "Category", value: "Smart Watch" },
        { label: "Connectivity", value: "Bluetooth, Wi-Fi, GPS" },
        { label: "Sensors", value: "Fitness and health tracking" },
        { label: "Battery", value: "All-day wearable battery life" },
      ];
    case "vr":
      return [
        { label: "Category", value: "VR Headset" },
        { label: "Display", value: "Immersive dual-display system" },
        { label: "Tracking", value: "Spatial motion tracking" },
        { label: "Audio", value: "Immersive audio support" },
      ];
    default:
      return [
        { label: "Category", value: "Consumer Electronics" },
        { label: "Quality", value: "Database-backed catalog listing" },
        { label: "Fulfillment", value: "Ships from managed inventory" },
      ];
  }
}

export function buildProductSpecSheet(source: ProductSpecSource): ProductSpec[] {
  const metadata = source.metadata;
  const storedProfile = asString(metadata?.product_profile) as
    | ProductProfile
    | undefined;
  const profile =
    storedProfile ||
    inferProductProfile({
      title: source.title,
      handle: source.handle,
      collection_id: source.collection_id,
    });
  const facts = getEditableProductFacts(metadata);
  const specs: ProductSpec[] = [];

  if (facts.color) {
    specs.push({ label: "Color", value: facts.color });
  }

  if (facts.storage) {
    specs.push({ label: "Storage", value: facts.storage });
  }

  specs.push(...getProfileSpecs(profile));

  if (source.is_certified_pre_owned) {
    specs.push({ label: "Condition", value: "Certified Pre-Owned" });
  }

  if (typeof source.battery_health === "number") {
    specs.push({
      label: "Battery Health",
      value: `${source.battery_health}%`,
    });
  }

  if (source.grading_data) {
    specs.push({ label: "Grading", value: source.grading_data });
  }

  if (source.handle) {
    specs.push({ label: "Handle", value: source.handle });
  }

  return specs;
}
