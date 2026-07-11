"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminActionAccess } from "@/lib/admin-auth";
import {
  createAdminProduct,
  incrementAdminProductInventory,
  removeAdminProduct,
  updateAdminProduct,
} from "@/lib/admin-data";
import {
  getUploadExtension,
  saveProductMedia,
} from "@/lib/product-media-storage";
import { inferReferenceUrlFromBrandAndModel } from "@/lib/product-specs";

function buildRedirectPath(
  locale: string,
  status: string,
  message: string,
  edit?: string,
  reset?: string,
) {
  const params = new URLSearchParams({ status, message });

  if (edit) {
    params.set("edit", edit);
  }

  if (reset) {
    params.set("reset", reset);
  }

  return `/${locale}/admin/products?${params.toString()}`;
}

function parseCurrencyCode(rawValue: FormDataEntryValue | null) {
  const normalized = String(rawValue || "usd")
    .trim()
    .toLowerCase();

  if (normalized === "usd" || normalized === "krw") {
    return normalized;
  }

  throw new Error("Currency is invalid.");
}

const PRODUCT_CATEGORIES = [
  "phones",
  "audio",
  "computing",
  "wearables",
  "accessories",
  "skincare",
  "shoes",
] as const;

function parsePriceToMinorUnits(rawValue: string, currencyCode: string) {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    throw new Error("Price is required.");
  }

  if (currencyCode === "krw") {
    if (!/^\d+$/.test(trimmed)) {
      throw new Error("KRW price must be a whole number.");
    }

    return Number.parseInt(trimmed, 10);
  }

  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    throw new Error("Price must be a valid number with up to 2 decimals.");
  }

  return Math.round(Number(trimmed) * 100);
}

function validateProductImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Uploaded product files must be images.");
  }

  const maxFileSize = 5 * 1024 * 1024;

  if (file.size > maxFileSize) {
    throw new Error("Each uploaded product image must be 5MB or smaller.");
  }

  const extension = getUploadExtension(file);

  if (!extension) {
    throw new Error(
      "Unsupported image format. Use JPG, PNG, WebP, GIF, or AVIF.",
    );
  }
}

function parseExistingImageUrls(formData: FormData) {
  return formData
    .getAll("existingImageUrls")
    .map((value) => String(value || "").trim())
    .filter(Boolean);
}

async function resolveProductImageValues(formData: FormData) {
  const thumbnail = String(formData.get("thumbnail") || "").trim();
  const imageFiles = formData
    .getAll("productImageFiles")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const existingImageUrls = parseExistingImageUrls(formData);

  if (imageFiles.length > 0) {
    const uploadedUrls = [];

    for (const imageFile of imageFiles) {
      validateProductImageFile(imageFile);
      uploadedUrls.push(await saveProductMedia(imageFile));
    }

    return {
      thumbnail: uploadedUrls[0] || thumbnail,
      imageUrls: uploadedUrls,
    };
  }

  const imageUrls = thumbnail
    ? [thumbnail, ...existingImageUrls.filter((url) => url !== thumbnail)]
    : existingImageUrls;

  return {
    thumbnail: thumbnail || imageUrls[0] || "",
    imageUrls,
  };
}

function parseProductCategory(rawValue: FormDataEntryValue | null) {
  const normalized = String(rawValue || "phones").trim();

  if (
    PRODUCT_CATEGORIES.includes(
      normalized as (typeof PRODUCT_CATEGORIES)[number],
    )
  ) {
    return normalized;
  }

  throw new Error("Product category is invalid.");
}

function parseStatus(rawValue: FormDataEntryValue | null) {
  const normalized = String(rawValue || "published");

  if (
    normalized === "draft" ||
    normalized === "published" ||
    normalized === "proposed" ||
    normalized === "rejected"
  ) {
    return normalized;
  }

  throw new Error("Status is invalid.");
}

function parseBatteryHealth(rawValue: FormDataEntryValue | null) {
  const normalized = String(rawValue || "").trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new Error("Battery health is invalid.");
  }

  return parsed;
}

function parseStorage(rawValue: FormDataEntryValue | null) {
  const normalized = String(rawValue || "").trim();
  const allowed = ["", "32", "64", "128", "256", "512", "1024", "2048"];

  if (!allowed.includes(normalized)) {
    throw new Error("Storage option is invalid.");
  }

  return normalized;
}

function parseGrade(rawValue: FormDataEntryValue | null) {
  const normalized = String(rawValue || "").trim();

  if (!normalized) {
    return "";
  }

  if (["Grade A", "Grade B", "Grade C"].includes(normalized)) {
    return normalized;
  }

  throw new Error("Grading option is invalid.");
}

function parseProductCondition(rawValue: FormDataEntryValue | null) {
  const normalized = String(rawValue || "new").trim();

  if (normalized === "certified_pre_owned") {
    return true;
  }

  if (normalized === "new") {
    return false;
  }

  throw new Error("Product condition is invalid.");
}

function parseImei(rawValue: FormDataEntryValue | null) {
  const normalized = String(rawValue || "").trim();

  if (!normalized) {
    return "";
  }

  if (!/^[0-9]{14,16}$/.test(normalized)) {
    throw new Error("IMEI must be 14 to 16 digits.");
  }

  return normalized;
}

function parseOptionalText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function buildProductTitle(brandName: string, modelName: string) {
  const title = `${brandName.trim()} ${modelName.trim()}`.trim();

  if (!title) {
    throw new Error("Brand name and model are required.");
  }

  return title;
}

function inferBrandName(modelName: string) {
  const normalized = modelName.toLowerCase();

  if (normalized.includes("iphone")) {
    return "Apple";
  }

  if (normalized.includes("galaxy")) {
    return "Samsung";
  }

  if (normalized.includes("pixel")) {
    return "Google";
  }

  return "";
}

function resolveBrandName(rawBrandName: string, modelName: string) {
  return rawBrandName.trim() || inferBrandName(modelName);
}

function revalidateAdminProductPaths(locale: string) {
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/products`);
  revalidatePath(`/${locale}/collections`);
  revalidatePath(`/${locale}/collections/phones`);
  revalidatePath(`/${locale}/collections/audio`);
  revalidatePath(`/${locale}/collections/computing`);
  revalidatePath(`/${locale}/collections/wearables`);
  revalidatePath(`/${locale}/collections/accessories`);
  revalidatePath(`/${locale}/collections/skincare`);
  revalidatePath(`/${locale}/collections/shoes`);
  revalidatePath(`/${locale}/search`);
  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}/admin/products`);
}

function resolveReferenceUrl(
  brandName: string,
  modelName: string,
  rawReferenceUrl: string,
) {
  const referenceUrl = rawReferenceUrl.trim();

  if (referenceUrl) {
    return referenceUrl;
  }

  return inferReferenceUrlFromBrandAndModel(brandName, modelName) || "";
}

export async function addProductAction(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  await requireAdminActionAccess(locale);

  try {
    const modelName = String(formData.get("modelName") || "").trim();
    const brandName = resolveBrandName(
      String(formData.get("brandName") || ""),
      modelName,
    );
    const title = buildProductTitle(brandName, modelName);
    const handle = String(formData.get("handle") || "");
    const description = String(formData.get("description") || "");
    const { thumbnail, imageUrls } = await resolveProductImageValues(formData);
    const collectionId = parseProductCategory(formData.get("collectionId"));
    const referenceUrl = resolveReferenceUrl(
      brandName,
      modelName,
      String(formData.get("referenceUrl") || ""),
    );
    const color = parseOptionalText(formData, "color");
    const storage = parseStorage(formData.get("storage"));
    const imei = parseImei(formData.get("imei"));
    const compatibility = parseOptionalText(formData, "compatibility");
    const material = parseOptionalText(formData, "material");
    const ram = parseOptionalText(formData, "ram");
    const processor = parseOptionalText(formData, "processor");
    const sizeVolume = parseOptionalText(formData, "sizeVolume");
    const skinType = parseOptionalText(formData, "skinType");
    const ingredients = parseOptionalText(formData, "ingredients");
    const expirationDate = parseOptionalText(formData, "expirationDate");
    const shoeSize = parseOptionalText(formData, "shoeSize");
    const genderFit = parseOptionalText(formData, "genderFit");
    const gradingData = parseGrade(formData.get("gradingData"));
    const batteryHealth = parseBatteryHealth(formData.get("batteryHealth"));
    const isCertifiedPreOwned = parseProductCondition(
      formData.get("productCondition"),
    );
    const inventory = Number.parseInt(
      String(formData.get("inventory") || "0"),
      10,
    );
    const currencyCode = parseCurrencyCode(formData.get("currencyCode"));
    const price = parsePriceToMinorUnits(
      String(formData.get("price") || ""),
      currencyCode,
    );
    const status = parseStatus(formData.get("status"));

    await createAdminProduct({
      brandName,
      modelName,
      title,
      handle,
      description,
      thumbnail,
      imageUrls,
      collectionId,
      referenceUrl,
      color,
      storage,
      imei,
      compatibility,
      material,
      ram,
      processor,
      sizeVolume,
      skinType,
      ingredients,
      expirationDate,
      shoeSize,
      genderFit,
      gradingData,
      batteryHealth,
      isCertifiedPreOwned,
      inventory,
      price,
      currencyCode,
      status,
    });

    revalidateAdminProductPaths(locale);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to add product.";
    redirect(buildRedirectPath(locale, "error", message));
  }

  redirect(
    buildRedirectPath(
      locale,
      "success",
      "Product added successfully.",
      undefined,
      Date.now().toString(),
    ),
  );
}

export async function updateProductAction(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  const productId = String(formData.get("productId") || "");
  await requireAdminActionAccess(locale);

  try {
    const modelName = String(formData.get("modelName") || "").trim();
    const brandName = resolveBrandName(
      String(formData.get("brandName") || ""),
      modelName,
    );
    const title = buildProductTitle(brandName, modelName);
    const handle = String(formData.get("handle") || "");
    const description = String(formData.get("description") || "");
    const { thumbnail, imageUrls } = await resolveProductImageValues(formData);
    const collectionId = parseProductCategory(formData.get("collectionId"));
    const referenceUrl = resolveReferenceUrl(
      brandName,
      modelName,
      String(formData.get("referenceUrl") || ""),
    );
    const color = parseOptionalText(formData, "color");
    const storage = parseStorage(formData.get("storage"));
    const imei = parseImei(formData.get("imei"));
    const compatibility = parseOptionalText(formData, "compatibility");
    const material = parseOptionalText(formData, "material");
    const ram = parseOptionalText(formData, "ram");
    const processor = parseOptionalText(formData, "processor");
    const sizeVolume = parseOptionalText(formData, "sizeVolume");
    const skinType = parseOptionalText(formData, "skinType");
    const ingredients = parseOptionalText(formData, "ingredients");
    const expirationDate = parseOptionalText(formData, "expirationDate");
    const shoeSize = parseOptionalText(formData, "shoeSize");
    const genderFit = parseOptionalText(formData, "genderFit");
    const gradingData = parseGrade(formData.get("gradingData"));
    const batteryHealth = parseBatteryHealth(formData.get("batteryHealth"));
    const isCertifiedPreOwned = parseProductCondition(
      formData.get("productCondition"),
    );
    const inventory = Number.parseInt(
      String(formData.get("inventory") || "0"),
      10,
    );
    const currencyCode = parseCurrencyCode(formData.get("currencyCode"));
    const price = parsePriceToMinorUnits(
      String(formData.get("price") || ""),
      currencyCode,
    );
    const status = parseStatus(formData.get("status"));

    await updateAdminProduct({
      productId,
      brandName,
      modelName,
      title,
      handle,
      description,
      thumbnail,
      imageUrls,
      collectionId,
      referenceUrl,
      color,
      storage,
      imei,
      compatibility,
      material,
      ram,
      processor,
      sizeVolume,
      skinType,
      ingredients,
      expirationDate,
      shoeSize,
      genderFit,
      gradingData,
      batteryHealth,
      isCertifiedPreOwned,
      inventory,
      price,
      currencyCode,
      status,
    });

    revalidateAdminProductPaths(locale);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update product.";
    redirect(buildRedirectPath(locale, "error", message, productId));
  }

  redirect(
    buildRedirectPath(locale, "success", "Product updated successfully."),
  );
}

export async function removeProductAction(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  const productId = String(formData.get("productId") || "");
  let removed = false;
  await requireAdminActionAccess(locale);

  try {
    removed = await removeAdminProduct(productId);

    revalidateAdminProductPaths(locale);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to remove product.";
    redirect(buildRedirectPath(locale, "error", message));
  }

  if (!removed) {
    redirect(buildRedirectPath(locale, "error", "Product was not found."));
  }

  redirect(
    buildRedirectPath(locale, "success", "Product removed successfully."),
  );
}

export async function addInventoryAction(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  const productId = String(formData.get("productId") || "");
  const amount = Number.parseInt(String(formData.get("amount") || "1"), 10);
  let updated = false;
  await requireAdminActionAccess(locale);

  try {
    updated = await incrementAdminProductInventory(productId, amount);

    revalidateAdminProductPaths(locale);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update inventory.";
    redirect(buildRedirectPath(locale, "error", message));
  }

  if (!updated) {
    redirect(buildRedirectPath(locale, "error", "Product was not found."));
  }

  redirect(
    buildRedirectPath(locale, "success", `Inventory increased by ${amount}.`),
  );
}
