import { cache } from "react";

export type ProductProfile =
  | "phone"
  | "laptop"
  | "watch"
  | "vr"
  | "generic";

export type EditableProductFacts = {
  color?: string;
  storage?: string;
  imei?: string;
};

function getStoredBrandName(metadata?: Record<string, unknown> | null) {
  return asString(metadata?.brand_name);
}

function getStoredModelName(metadata?: Record<string, unknown> | null) {
  return asString(metadata?.model_name);
}

export type ProductSpec = {
  label: string;
  value: string;
};

export type ProductSpecSection = {
  title: string;
  specs: ProductSpec[];
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

function isProductSpec(value: unknown): value is ProductSpec {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return typeof record.label === "string" && typeof record.value === "string";
}

function isProductSpecSection(value: unknown): value is ProductSpecSection {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.title === "string" &&
    Array.isArray(record.specs) &&
    record.specs.every(isProductSpec)
  );
}

export function sanitizeHttpUrl(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  try {
    const url = new URL(trimmed);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}

function getSamsungSpecsUrl(referenceUrl?: string | null) {
  const sanitizedUrl = sanitizeHttpUrl(referenceUrl);

  if (!sanitizedUrl) {
    return undefined;
  }

  try {
    const url = new URL(sanitizedUrl);

    if (!/samsung\.com$/i.test(url.hostname) && !/\.samsung\.com$/i.test(url.hostname)) {
      return sanitizedUrl;
    }

    if (/\/specs\/?$/i.test(url.pathname)) {
      return url.toString();
    }

    url.pathname = `${url.pathname.replace(/\/+$/, "")}/specs/`;
    url.search = "";
    url.hash = "";

    return url.toString();
  } catch {
    return sanitizedUrl;
  }
}

function getAppleSupportSpecsUrl(referenceUrl?: string | null) {
  const sanitizedUrl = sanitizeHttpUrl(referenceUrl);

  if (!sanitizedUrl) {
    return undefined;
  }

  try {
    const url = new URL(sanitizedUrl);

    if (
      url.hostname !== "support.apple.com" &&
      !url.hostname.endsWith(".support.apple.com")
    ) {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value: string) {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function normalizeSpecKey(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeText(value: string | null | undefined) {
  return value?.toLowerCase().trim() || "";
}

function titleCaseWords(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function inferBrand(source: {
  title?: string;
  handle?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const storedBrand = getStoredBrandName(source.metadata);

  if (storedBrand) {
    return storedBrand;
  }

  const haystack = [source.title, source.handle]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (haystack.includes("samsung") || haystack.includes("galaxy")) {
    return "Samsung";
  }

  if (haystack.includes("iphone") || haystack.includes("apple")) {
    return "Apple";
  }

  if (haystack.includes("pixel") || haystack.includes("google")) {
    return "Google";
  }

  if (haystack.includes("aman")) {
    return "Aman mobile";
  }

  return undefined;
}

function inferModelName(source: {
  title?: string;
  handle?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const storedModel = getStoredModelName(source.metadata);

  if (storedModel) {
    return storedModel;
  }

  const title = source.title?.trim();

  if (title) {
    return title;
  }

  if (!source.handle) {
    return undefined;
  }

  return titleCaseWords(source.handle.replace(/[-_]+/g, " "));
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

  if (/(phone|mobile|iphone|galaxy|pixel|samsung|android|ultra|fold|flip)/.test(haystack)) {
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
    imei: asString(specFacts?.imei),
  } satisfies EditableProductFacts;
}

export function getProductReferenceUrl(
  metadata?: Record<string, unknown> | null,
) {
  return sanitizeHttpUrl(asString(metadata?.reference_url));
}

export function getStoredReferenceSpecs(
  metadata?: Record<string, unknown> | null,
) {
  const rawSpecs = metadata?.reference_specs;

  if (!Array.isArray(rawSpecs)) {
    return [] as ProductSpec[];
  }

  return rawSpecs.filter(isProductSpec).map((spec) => ({
    label: spec.label.trim(),
    value: spec.value.trim(),
  }));
}

export function getStoredReferenceSpecSections(
  metadata?: Record<string, unknown> | null,
) {
  const rawSections = metadata?.reference_spec_sections;

  if (!Array.isArray(rawSections)) {
    return [] as ProductSpecSection[];
  }

  return rawSections.filter(isProductSpecSection).map((section) => ({
    title: section.title.trim(),
    specs: section.specs.map((spec) => ({
      label: spec.label.trim(),
      value: spec.value.trim(),
    })),
  }));
}

export function buildProductMetadata(
  existingMetadata: Record<string, unknown> | undefined,
  source: {
    title?: string;
    handle?: string;
    collection_id?: string | null;
    color?: string;
    storage?: string;
    imei?: string;
    brandName?: string;
    modelName?: string;
    referenceUrl?: string;
    referenceSpecs?: ProductSpec[];
    referenceSpecSections?: ProductSpecSection[];
  },
) {
  const inferredProfile = inferProductProfile(source);
  const existingProfile = asString(existingMetadata?.product_profile);
  const profile =
    existingProfile && existingProfile !== "generic"
      ? existingProfile
      : inferredProfile;
  const sanitizedReferenceUrl = sanitizeHttpUrl(source.referenceUrl);

  return {
    ...(existingMetadata || {}),
    brand_name: source.brandName?.trim() || null,
    model_name: source.modelName?.trim() || null,
    product_profile: profile,
    reference_url: sanitizedReferenceUrl || null,
    reference_specs: source.referenceSpecs?.length ? source.referenceSpecs : null,
    reference_spec_sections: source.referenceSpecSections?.length
      ? source.referenceSpecSections
      : null,
    spec_facts: {
      color: source.color?.trim() || null,
      storage: source.storage?.trim() || null,
      imei: source.imei?.trim() || null,
    },
  };
}

function getProfileSpecs(profile: ProductProfile) {
  switch (profile) {
    case "phone":
      return [
        { label: "Category", value: "Smartphone" },
        { label: "Display", value: "High-resolution OLED display" },
        { label: "Chipset Class", value: "Flagship mobile performance tier" },
        { label: "Connectivity", value: "5G, Wi-Fi, Bluetooth, NFC" },
        { label: "Camera System", value: "Multi-lens rear camera setup" },
        { label: "Security", value: "Biometric unlock support" },
        { label: "Build", value: "Premium lightweight frame" },
        { label: "Charging", value: "Fast wired and wireless charging support" },
      ];
    case "laptop":
      return [
        { label: "Category", value: "Laptop" },
        { label: "Display", value: "High-resolution productivity display" },
        { label: "Chipset Class", value: "Productivity and creator performance tier" },
        { label: "Performance", value: "Creator and multitasking focused" },
        { label: "Memory", value: "Modern multitasking memory configuration" },
        { label: "Storage Type", value: "Solid-state storage" },
        { label: "Portability", value: "Slim portable chassis" },
        { label: "Battery", value: "All-day mobile workflow battery life" },
      ];
    case "watch":
      return [
        { label: "Category", value: "Smart Watch" },
        { label: "Connectivity", value: "Bluetooth, Wi-Fi, GPS" },
        { label: "Sensors", value: "Fitness and health tracking" },
        { label: "Durability", value: "Daily wear resistant build" },
        { label: "Compatibility", value: "Pairs with modern smartphones" },
        { label: "Battery", value: "All-day wearable battery life" },
      ];
    case "vr":
      return [
        { label: "Category", value: "VR Headset" },
        { label: "Display", value: "Immersive dual-display system" },
        { label: "Tracking", value: "Spatial motion tracking" },
        { label: "Controls", value: "Gesture or controller-based input support" },
        { label: "Audio", value: "Immersive audio support" },
        { label: "Use Case", value: "Entertainment, productivity, and mixed reality" },
      ];
    default:
      return [
        { label: "Category", value: "Consumer Electronics" },
        { label: "Quality", value: "Database-backed catalog listing" },
        { label: "Fulfillment", value: "Ships from managed inventory" },
        { label: "Availability", value: "Subject to live inventory status" },
      ];
  }
}

function mergeSpecs(...groups: ProductSpec[][]) {
  const merged = new Map<string, ProductSpec>();

  for (const group of groups) {
    for (const spec of group) {
      const label = spec.label.trim();
      const value = spec.value.trim();

      if (!label || !value) {
        continue;
      }

      merged.set(normalizeSpecKey(label), { label, value });
    }
  }

  return Array.from(merged.values());
}

function mergeSections(...groups: ProductSpecSection[][]) {
  const merged = new Map<string, ProductSpecSection>();

  for (const group of groups) {
    for (const section of group) {
      const title = section.title.trim();

      if (!title) {
        continue;
      }

      const existing = merged.get(title);

      if (existing) {
        existing.specs = mergeSpecs(existing.specs, section.specs);
      } else {
        merged.set(title, {
          title,
          specs: mergeSpecs(section.specs),
        });
      }
    }
  }

  return Array.from(merged.values()).filter((section) => section.specs.length > 0);
}

function collectJsonLdSpecs(html: string) {
  const specs: ProductSpec[] = [];
  const matches = html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  function walk(node: unknown) {
    if (!node || typeof node !== "object") {
      return;
    }

    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    const record = node as Record<string, unknown>;
    const additionalProperty = record.additionalProperty;

    if (Array.isArray(additionalProperty)) {
      for (const entry of additionalProperty) {
        const pair = entry as Record<string, unknown>;
        const label = asString(pair.name);
        const value = asString(pair.value);

        if (label && value) {
          specs.push({ label, value });
        }
      }
    }

    Object.values(record).forEach(walk);
  }

  for (const match of matches) {
    try {
      walk(JSON.parse(match[1]));
    } catch {}
  }

  return specs;
}

function collectTableSpecs(html: string) {
  const specs: ProductSpec[] = [];
  const tableMatches = html.matchAll(
    /<tr[^>]*>\s*(?:<th[^>]*>|<td[^>]*>)([\s\S]*?)<\/(?:th|td)>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi,
  );

  for (const match of tableMatches) {
    const label = stripHtml(match[1]);
    const value = stripHtml(match[2]);

    if (label && value) {
      specs.push({ label, value });
    }
  }

  return specs;
}

function collectDefinitionListSpecs(html: string) {
  const specs: ProductSpec[] = [];
  const matches = html.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi);

  for (const match of matches) {
    const label = stripHtml(match[1]);
    const value = stripHtml(match[2]);

    if (label && value) {
      specs.push({ label, value });
    }
  }

  return specs;
}

function collectLabeledBlockSpecs(html: string) {
  const specs: ProductSpec[] = [];
  const matches = html.matchAll(
    /<(?:div|li|p|span)[^>]*>\s*([^<:]{2,80}?)\s*:\s*([^<]{1,160})\s*<\/(?:div|li|p|span)>/gi,
  );

  for (const match of matches) {
    const label = stripHtml(match[1]);
    const value = stripHtml(match[2]);

    if (label && value) {
      specs.push({ label, value });
    }
  }

  return specs;
}

function collectPreviewImage(html: string) {
  const metaMatch = html.match(
    /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i,
  );

  return sanitizeHttpUrl(metaMatch?.[1]);
}

function collectMetaBackedSpecs(html: string) {
  const specs: ProductSpec[] = [];
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descriptionMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
  );
  const keywordMatch = html.match(
    /<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)["']/i,
  );
  const canonicalMatch = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
  );

  if (titleMatch?.[1]) {
    specs.push({ label: "Reference Title", value: stripHtml(titleMatch[1]) });
  }

  if (descriptionMatch?.[1]) {
    specs.push({
      label: "Reference Summary",
      value: stripHtml(descriptionMatch[1]),
    });
  }

  if (keywordMatch?.[1]) {
    const topKeywords = keywordMatch[1]
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6)
      .join(", ");

    if (topKeywords) {
      specs.push({ label: "Highlights", value: topKeywords });
    }
  }

  if (canonicalMatch?.[1]) {
    try {
      const url = new URL(canonicalMatch[1]);
      specs.push({ label: "Reference Source", value: url.hostname });
    } catch {}
  }

  return specs;
}

function normalizeSamsungImageUrl(value?: string | null) {
  if (!value) {
    return undefined;
  }

  if (value.startsWith("//")) {
    return sanitizeHttpUrl(`https:${value}`);
  }

  return sanitizeHttpUrl(value);
}

function cleanSectionTitle(value: string) {
  return stripHtml(value).replace(/\s+\d+$/, "").trim();
}

function inferAppleSpecLabel(sectionTitle: string, value: string, index: number) {
  const normalizedSection = normalizeSpecKey(sectionTitle);
  const normalizedValue = normalizeSpecKey(value);

  if (normalizedSection === "finish") {
    return index === 0 ? "Materials" : `Finish Option ${index}`;
  }

  if (normalizedSection === "capacity") {
    return `Capacity Option ${index + 1}`;
  }

  if (normalizedSection === "size and weight") {
    if (normalizedValue.includes("width")) return "Width";
    if (normalizedValue.includes("height")) return "Height";
    if (normalizedValue.includes("depth")) return "Depth";
    if (normalizedValue.includes("weight")) return "Weight";
  }

  if (normalizedSection === "display") {
    if (normalizedValue.includes("super retina") || normalizedValue.includes("oled")) {
      return "Display Type";
    }
    if (normalizedValue.includes("inch")) return "Size";
    if (normalizedValue.includes("resolution")) return "Resolution";
    if (normalizedValue.includes("promotion") || normalizedValue.includes("refresh")) {
      return "Refresh Rate";
    }
    if (normalizedValue.includes("brightness")) return "Brightness";
    if (normalizedValue.includes("dynamic island")) return "Interface";
    if (normalizedValue.includes("true tone")) return "True Tone";
    if (normalizedValue.includes("wide color")) return "Color Gamut";
  }

  if (normalizedSection === "chip") {
    if (normalizedValue.includes("chip")) return "Chip";
    if (normalizedValue.includes("cpu")) return "CPU";
    if (normalizedValue.includes("gpu")) return "GPU";
    if (normalizedValue.includes("neural")) return "Neural Engine";
  }

  if (normalizedSection === "camera" || normalizedSection === "truedepth camera") {
    if (normalizedValue.includes("digital zoom")) return "Digital Zoom";
    if (normalizedValue.includes("optical zoom")) return "Optical Zoom";
    if (normalizedValue.includes("camera control")) return "Camera Control";
    if (normalizedValue.includes("night mode")) return "Night Mode";
    if (normalizedValue.includes("photonic engine")) return "Photonic Engine";
    if (normalizedValue.includes("deep fusion")) return "Deep Fusion";
  }

  if (normalizedSection === "power and battery") {
    if (normalizedValue.includes("video playback streamed")) {
      return "Streaming Playback";
    }
    if (normalizedValue.includes("video playback")) return "Video Playback";
    if (normalizedValue.includes("audio playback")) return "Audio Playback";
    if (normalizedValue.includes("magsafe")) return "MagSafe Charging";
    if (normalizedValue.includes("qi2")) return "Qi2 Charging";
    if (normalizedValue.includes("qi wireless")) return "Qi Charging";
    if (normalizedValue.includes("fast charge")) return "Fast Charge";
  }

  if (normalizedSection === "cellular and wireless") {
    if (normalizedValue.includes("wi fi")) return "Wi-Fi";
    if (normalizedValue.includes("bluetooth")) return "Bluetooth";
    if (normalizedValue.includes("ultra wideband")) return "Ultra Wideband";
    if (normalizedValue.includes("thread networking")) return "Thread Networking";
    if (normalizedValue.includes("nfc")) return "NFC";
    if (normalizedValue.includes("express cards")) return "Express Cards";
    if (normalizedValue.includes("satellite")) return "Satellite";
    if (normalizedValue.includes("5g")) return "5G";
    if (normalizedValue.includes("lte")) return "LTE";
  }

  if (normalizedSection === "charging and expansion") {
    if (normalizedValue.includes("usb c")) return "Port";
    if (normalizedValue.includes("charging")) return "Charging";
    if (normalizedValue.includes("displayport")) return "Display Output";
    if (normalizedValue.includes("usb 3")) return "Data Speed";
  }

  if (normalizedSection === "sensors") {
    if (normalizedValue.includes("face id")) return "Face ID";
    if (normalizedValue.includes("lidar")) return "LiDAR Scanner";
    if (normalizedValue.includes("barometer")) return "Barometer";
    if (normalizedValue.includes("gyro")) return "Gyroscope";
    if (normalizedValue.includes("accelerometer")) return "Accelerometer";
    if (normalizedValue.includes("proximity")) return "Proximity Sensor";
    if (normalizedValue.includes("ambient light")) return "Ambient Light Sensor";
  }

  return `${sectionTitle} Detail ${index + 1}`;
}

function parseAppleSupportSpecs(sectionTitle: string, sectionHtml: string) {
  const specs: ProductSpec[] = [];
  const introParagraphs = Array.from(
    sectionHtml.matchAll(
      /<p[^>]*class=["'][^"']*gb-paragraph[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi,
    ),
  )
    .map((match) => match[1])
    .filter((content) => !/<\/?li\b/i.test(content));

  const firstParagraph = introParagraphs[0]
    ? stripHtml(introParagraphs[0]).replace(/:$/, "").trim()
    : "";

  if (firstParagraph && !firstParagraph.includes("http")) {
    if (normalizeSpecKey(sectionTitle) === "camera") {
      specs.push({ label: "Camera System", value: firstParagraph });
    } else if (normalizeSpecKey(sectionTitle) === "truedepth camera") {
      specs.push({ label: "Front Camera", value: firstParagraph });
    }
  }

  const listItems = Array.from(sectionHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map(
    (match) => match[1],
  );

  listItems.forEach((itemHtml, index) => {
    const boldLabelMatch = itemHtml.match(
      /^\s*(?:<p[^>]*>)?\s*<b[^>]*>([\s\S]*?)<\/b>\s*(.*)$/i,
    );

    if (boldLabelMatch) {
      const label = stripHtml(boldLabelMatch[1]).replace(/:\s*$/, "").trim();
      const value = stripHtml(boldLabelMatch[2]).trim();

      if (label && value) {
        specs.push({ label, value });
        return;
      }
    }

    const text = stripHtml(itemHtml).trim();

    if (!text) {
      return;
    }

    const colonMatch = text.match(/^([^:]{1,80}):\s+(.+)$/);

    if (colonMatch) {
      specs.push({
        label: colonMatch[1].trim(),
        value: colonMatch[2].trim(),
      });
      return;
    }

    specs.push({
      label: inferAppleSpecLabel(sectionTitle, text, index),
      value: text,
    });
  });

  return mergeSpecs(specs);
}

const fetchAppleSupportReferenceData = cache(async (referenceUrl: string) => {
  const appleSupportUrl = getAppleSupportSpecsUrl(referenceUrl);

  if (!appleSupportUrl) {
    return null;
  }

  const response = await fetch(appleSupportUrl, {
    headers: {
      "user-agent": "Mozilla/5.0 EphiKorea Specs Fetcher",
      "accept-language": "en-US,en;q=0.9",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return null;
  }

  const html = await response.text();
  const previewImage = collectPreviewImage(html);
  const sections: ProductSpecSection[] = [];
  const headingMatches = Array.from(
    html.matchAll(
      /<h3[^>]*class=["'][^"']*gb-header[^"']*["'][^>]*>([\s\S]*?)<\/h3>/gi,
    ),
  );

  for (let index = 0; index < headingMatches.length; index += 1) {
    const currentMatch = headingMatches[index];
    const nextMatch = headingMatches[index + 1];
    const title = cleanSectionTitle(currentMatch[1]);
    const start = currentMatch.index! + currentMatch[0].length;
    const end = nextMatch?.index ?? html.length;
    const sectionHtml = html.slice(start, end);
    const specs = parseAppleSupportSpecs(title, sectionHtml);

    if (title && specs.length > 0) {
      sections.push({ title, specs });
    }
  }

  return {
    previewImage,
    specs: mergeSpecs(...sections.map((section) => section.specs)),
    sections: mergeSections(sections),
  };
});

function extractSamsungInputValue(html: string, inputId: string) {
  const match = html.match(
    new RegExp(
      `<input[^>]+id=["']${inputId}["'][^>]+value=["']([^"']*)["']`,
      "i",
    ),
  );

  return match?.[1];
}

function extractSamsungModelCode(html: string) {
  const activeSpecMatch = html.match(
    /js-spec-tab is-active"[^>]*data-model-code="([^"]+)"/i,
  );

  if (activeSpecMatch?.[1]) {
    return activeSpecMatch[1];
  }

  const anySpecMatch = html.match(/js-spec-tab[^>]*data-model-code="([^"]+)"/i);
  return anySpecMatch?.[1];
}

function extractSamsungDesignColors(html: string) {
  const designContainerMatch = html.match(
    /<div class="specification-tab__container is-active"[\s\S]*?<div class="specification__color-list">([\s\S]*?)<\/div>\s*<div class="specification-tab__disclaimer">([\s\S]*?)<\/div>/i,
  );

  if (!designContainerMatch) {
    return { colors: [] as string[], disclaimer: undefined as string | undefined };
  }

  const colors = Array.from(
    designContainerMatch[1].matchAll(/<figcaption>([\s\S]*?)<\/figcaption>/gi),
  )
    .map((match) => stripHtml(match[1]))
    .filter(Boolean);

  const disclaimer = stripHtml(designContainerMatch[2]);

  return {
    colors,
    disclaimer: disclaimer || undefined,
  };
}

type SamsungSpecApiItem = {
  attrName?: string | null;
  attrValue?: string | null;
  attrs?: SamsungSpecApiItem[] | null;
  subItems?: SamsungSpecApiItem[] | null;
};

type SamsungSpecResponse = {
  response?: {
    statusCode?: number;
    resultData?: {
      modelList?: Array<{
        spec?: {
          specItems?: SamsungSpecApiItem[];
        } | null;
        legalInfo?: {
          infoItems?: SamsungSpecApiItem[];
        } | null;
      }>;
      specAnnotation?: string | null;
    } | null;
  } | null;
};

function flattenSamsungSpecItems(items: SamsungSpecApiItem[] | null | undefined) {
  const specs: ProductSpec[] = [];

  for (const item of items || []) {
    const nestedItems = item.attrs || item.subItems;

    if (Array.isArray(nestedItems) && nestedItems.length > 0) {
      specs.push(...flattenSamsungSpecItems(nestedItems));
      continue;
    }

    const label = item.attrName?.trim();
    const value = item.attrValue?.trim();

    if (label && value) {
      specs.push({ label, value });
    }
  }

  return specs;
}

const fetchSamsungReferenceData = cache(async (referenceUrl: string) => {
  const samsungSpecsUrl = getSamsungSpecsUrl(referenceUrl);

  if (!samsungSpecsUrl) {
    return null;
  }

  const pageResponse = await fetch(samsungSpecsUrl, {
    headers: {
      "user-agent": "Mozilla/5.0 EphiKorea Specs Fetcher",
      "accept-language": "en-US,en;q=0.9",
    },
    next: { revalidate: 86400 },
  });

  if (!pageResponse.ok) {
    return null;
  }

  const html = await pageResponse.text();
  const searchDomain = extractSamsungInputValue(html, "searchDomain");
  const apiStageInfo = extractSamsungInputValue(html, "apiStageInfo");
  const siteCode = extractSamsungInputValue(html, "siteCode");
  const modelCode = extractSamsungModelCode(html);

  if (!searchDomain || !apiStageInfo || !siteCode || !modelCode) {
    return null;
  }

  const apiBase = searchDomain.startsWith("//")
    ? `https:${searchDomain}`
    : searchDomain;
  const apiUrl = new URL(`${apiBase}/${apiStageInfo}/b2c/product/spec/detail`);
  apiUrl.searchParams.set("siteCode", siteCode);
  apiUrl.searchParams.set("modelList", modelCode);
  apiUrl.searchParams.set("specAnnotationYN", "Y");

  const apiResponse = await fetch(apiUrl.toString(), {
    headers: {
      "user-agent": "Mozilla/5.0 EphiKorea Specs Fetcher",
      "accept-language": "en-US,en;q=0.9",
    },
    next: { revalidate: 86400 },
  });

  if (!apiResponse.ok) {
    return null;
  }

  const data = (await apiResponse.json()) as SamsungSpecResponse;

  if (data.response?.statusCode !== 200) {
    return null;
  }

  const model = data.response.resultData?.modelList?.[0];
  const specItems = model?.spec?.specItems || [];
  const legalInfoItems = model?.legalInfo?.infoItems || [];
  const { colors, disclaimer } = extractSamsungDesignColors(html);
  const previewImage = collectPreviewImage(html);
  const annotation = data.response.resultData?.specAnnotation
    ? stripHtml(data.response.resultData.specAnnotation)
    : undefined;

  const sections: ProductSpecSection[] = specItems
    .map((item) => {
      const title = item.attrName?.trim();
      const specs = Array.isArray(item.attrs) || Array.isArray(item.subItems)
        ? flattenSamsungSpecItems(item.attrs || item.subItems)
        : item.attrValue?.trim() && title
          ? [{ label: title, value: item.attrValue.trim() }]
          : [];

      if (!title || specs.length === 0) {
        return null;
      }

      return { title, specs };
    })
    .filter(Boolean) as ProductSpecSection[];

  if (colors.length > 0) {
    sections.unshift({
      title: "Design",
      specs: [
        { label: "Colours", value: colors.join(", ") },
        ...(disclaimer ? [{ label: "Colour Note", value: disclaimer }] : []),
      ],
    });
  }

  const legalSpecs = flattenSamsungSpecItems(legalInfoItems);

  if (legalSpecs.length > 0) {
    sections.push({
      title: "Legal Information",
      specs: legalSpecs,
    });
  }

  if (annotation) {
    sections.push({
      title: "Notes",
      specs: [{ label: "Specification Annotation", value: annotation }],
    });
  }

  return {
    previewImage: normalizeSamsungImageUrl(previewImage),
    specs: mergeSpecs(...sections.map((section) => section.specs)),
    sections: mergeSections(sections),
  };
});

export async function fetchReferenceSpecs(referenceUrl?: string | null) {
  if (!referenceUrl) {
    return [] as ProductSpec[];
  }

  try {
    if (/samsung\.com/i.test(referenceUrl)) {
      const samsungData = await fetchSamsungReferenceData(referenceUrl);

      if (samsungData?.specs.length) {
        return samsungData.specs;
      }
    }

    if (/support\.apple\.com/i.test(referenceUrl)) {
      const appleSupportData = await fetchAppleSupportReferenceData(referenceUrl);

      if (appleSupportData?.specs.length) {
        return appleSupportData.specs;
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(referenceUrl, {
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 EphiKorea Specs Fetcher",
        "accept-language": "en-US,en;q=0.9",
      },
      next: { revalidate: 86400 },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return [];
    }

    const html = await response.text();

    return mergeSpecs(
      collectJsonLdSpecs(html),
      collectTableSpecs(html),
      collectDefinitionListSpecs(html),
      collectLabeledBlockSpecs(html),
      collectMetaBackedSpecs(html),
    ).slice(0, 24);
  } catch {
    return [];
  }
}

export async function fetchReferenceSpecSections(referenceUrl?: string | null) {
  if (!referenceUrl) {
    return [] as ProductSpecSection[];
  }

  try {
    if (/samsung\.com/i.test(referenceUrl)) {
      const samsungData = await fetchSamsungReferenceData(referenceUrl);
      return samsungData?.sections || [];
    }

    if (/support\.apple\.com/i.test(referenceUrl)) {
      const appleSupportData = await fetchAppleSupportReferenceData(referenceUrl);
      return appleSupportData?.sections || [];
    }
  } catch {}

  return [];
}

export async function fetchReferencePreviewImage(referenceUrl?: string | null) {
  if (!referenceUrl) {
    return undefined;
  }

  try {
    if (/samsung\.com/i.test(referenceUrl)) {
      const samsungData = await fetchSamsungReferenceData(referenceUrl);
      return samsungData?.previewImage;
    }

    if (/support\.apple\.com/i.test(referenceUrl)) {
      const appleSupportData = await fetchAppleSupportReferenceData(referenceUrl);
      return appleSupportData?.previewImage;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(referenceUrl, {
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 EphiKorea Specs Fetcher",
        "accept-language": "en-US,en;q=0.9",
      },
      next: { revalidate: 86400 },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return undefined;
    }

    const html = await response.text();
    return collectPreviewImage(html);
  } catch {
    return undefined;
  }
}

export function buildProductSpecSheet(
  source: ProductSpecSource,
  referenceSpecs: ProductSpec[] = [],
): ProductSpec[] {
  const metadata = source.metadata;
  const storedProfile = asString(metadata?.product_profile) as
    | ProductProfile
    | undefined;
  const inferredProfile = inferProductProfile({
    title: source.title,
    handle: source.handle,
    collection_id: source.collection_id,
  });
  const profile =
    storedProfile && storedProfile !== "generic"
      ? storedProfile
      : inferredProfile;
  const facts = getEditableProductFacts(metadata);
  const brand = inferBrand(source);
  const model = inferModelName(source);
  const specs: ProductSpec[] = [];

  if (brand) {
    specs.push({ label: "Brand", value: brand });
  }

  if (model) {
    specs.push({ label: "Model", value: model });
  }

  if (facts.color) {
    specs.push({ label: "Color", value: facts.color });
  }

  if (facts.storage) {
    const storageValue = /^\d+$/.test(facts.storage)
      ? `${facts.storage}GB`
      : facts.storage;
    specs.push({ label: "Storage", value: storageValue });
  }

  if (facts.imei) {
    specs.push({ label: "IMEI", value: facts.imei });
  }

  const supplementalSpecs = [...getProfileSpecs(profile)];

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

  return mergeSpecs(
    supplementalSpecs,
    getStoredReferenceSpecs(metadata),
    referenceSpecs,
    specs,
  );
}

function hasSpecLabel(
  target: string,
  groups: Array<ProductSpec[] | ProductSpecSection[]>,
) {
  const normalizedTarget = normalizeSpecKey(target);

  return groups.some((group) =>
    group.some((entry) => {
      if ("title" in entry) {
        return entry.specs.some(
          (spec) => normalizeSpecKey(spec.label) === normalizedTarget,
        );
      }

      return normalizeSpecKey(entry.label) === normalizedTarget;
    }),
  );
}

export function buildProductSpecSections(
  source: ProductSpecSource,
  referenceSections: ProductSpecSection[] = [],
  referenceSpecs: ProductSpec[] = [],
) {
  const metadata = source.metadata;
  const facts = getEditableProductFacts(metadata);
  const storedSections = getStoredReferenceSpecSections(metadata);
  const mergedReferenceSections = mergeSections(storedSections, referenceSections);
  const groupsForDetection = [
    referenceSpecs,
    ...mergedReferenceSections.map((section) => section.specs),
  ];

  const overviewSpecs: ProductSpec[] = [];
  const conditionSpecs: ProductSpec[] = [];

  const brand = inferBrand(source);
  const model = inferModelName(source);

  if (brand) {
    overviewSpecs.push({ label: "Brand", value: brand });
  }

  if (model) {
    overviewSpecs.push({ label: "Model", value: model });
  }

  if (facts.color) {
    overviewSpecs.push({ label: "Color", value: facts.color });
  }

  if (facts.storage) {
    overviewSpecs.push({
      label: "Storage",
      value: /^\d+$/.test(facts.storage) ? `${facts.storage}GB` : facts.storage,
    });
  }

  if (facts.imei) {
    conditionSpecs.push({ label: "IMEI", value: facts.imei });
  }

  if (source.is_certified_pre_owned) {
    conditionSpecs.push({ label: "Condition", value: "Certified Pre-Owned" });
  }

  if (typeof source.battery_health === "number") {
    conditionSpecs.push({
      label: "Battery Health",
      value: `${source.battery_health}%`,
    });
  }

  if (source.grading_data) {
    conditionSpecs.push({ label: "Grading", value: source.grading_data });
  }

  if (source.handle) {
    conditionSpecs.push({ label: "Listing Handle", value: source.handle });
  }

  const sections: ProductSpecSection[] = [];

  if (overviewSpecs.length > 0) {
    sections.push({ title: "Overview", specs: overviewSpecs });
  }

  sections.push(...mergedReferenceSections);

  if (conditionSpecs.length > 0) {
    sections.push({ title: "Listing Details", specs: conditionSpecs });
  }

  if (sections.length > 0) {
    return sections;
  }

  return [
    {
      title: "Overview",
      specs: buildProductSpecSheet(source, referenceSpecs),
    },
  ];
}

const BUYER_SPEC_PRIORITIES: Record<string, string[]> = {
  Overview: ["brand", "model", "color", "storage"],
  Processor: ["cpu speed", "cpu type"],
  Chip: ["chip", "cpu", "gpu", "neural engine"],
  Capacity: ["capacity option 1", "capacity option 2", "capacity option 3"],
  "Size and Weight": ["width", "height", "depth", "weight"],
  Display: [
    "display type",
    "size",
    "resolution",
    "brightness",
    "refresh rate",
    "size main display",
    "resolution main display",
    "technology main display",
    "max refresh rate main display",
  ],
  Camera: [
    "camera system",
    "48mp fusion",
    "48mp ultra wide",
    "12mp 5x telephoto",
    "rear camera resolution multiple",
    "rear camera zoom",
    "front camera resolution",
    "video recording resolution",
  ],
  "Network/Bearer": ["number of sim", "sim slot type", "infra"],
  Connectivity: ["wi-fi", "bluetooth version", "nfc", "uwb ultra wideband"],
  "General Information": ["form factor"],
  "Physical specification": ["dimension hxwxd mm", "weight g"],
  Battery: [
    "battery capacity mah typical",
    "video playback time hours wireless",
  ],
  "Power and Battery": [
    "video playback",
    "streaming playback",
    "audio playback",
    "fast charge",
  ],
  "Cellular and Wireless": ["5g", "wi-fi", "bluetooth", "satellite"],
};

function pickImportantSpecs(section: ProductSpecSection) {
  const priorities = BUYER_SPEC_PRIORITIES[section.title];

  if (!priorities) {
    return section.specs.slice(0, 3);
  }

  const selected = priorities
    .map((priority) =>
      section.specs.find(
        (spec) => normalizeSpecKey(spec.label) === normalizeSpecKey(priority),
      ),
    )
    .filter(Boolean) as ProductSpec[];

  return mergeSpecs(selected).slice(0, 4);
}

export function buildBuyerFacingSpecSections(
  source: ProductSpecSource,
  referenceSections: ProductSpecSection[] = [],
  referenceSpecs: ProductSpec[] = [],
) {
  const excludedSections = new Set([
    "Design",
    "Storage/Memory",
    "Listing Details",
    "Sensors",
    "Services and Applications",
    "S Pen Support",
    "OS",
    "General Information",
    "Audio and Video",
    "Physical specification",
    "Connectivity",
  ]);

  const preferredOrder = [
    "Overview",
    "Processor",
    "Display",
    "Camera",
    "Battery",
  ];

  const sections = buildProductSpecSections(source, referenceSections, referenceSpecs)
    .filter((section) => !excludedSections.has(section.title))
    .map((section) => ({
      title: section.title,
      specs: pickImportantSpecs(section),
    }))
    .filter((section) => section.specs.length > 0)
    .sort((left, right) => {
      const leftIndex = preferredOrder.indexOf(left.title);
      const rightIndex = preferredOrder.indexOf(right.title);

      if (leftIndex === -1 && rightIndex === -1) {
        return left.title.localeCompare(right.title);
      }

      if (leftIndex === -1) {
        return 1;
      }

      if (rightIndex === -1) {
        return -1;
      }

      return leftIndex - rightIndex;
    });

  return sections;
}
