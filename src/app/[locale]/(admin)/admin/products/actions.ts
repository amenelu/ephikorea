"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createAdminProduct,
  removeAdminProduct,
  updateAdminProduct,
} from "@/lib/admin-data";

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

function parsePriceToMinorUnits(rawValue: string) {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    throw new Error("Price is required.");
  }

  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    throw new Error("Price must be a valid number with up to 2 decimals.");
  }

  return Math.round(Number(trimmed) * 100);
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

  if (!Number.isFinite(parsed) || parsed < 50 || parsed > 100) {
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

function revalidateAdminProductPaths(locale: string) {
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/products`);
  revalidatePath(`/${locale}/search`);
  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}/admin/products`);
}

export async function addProductAction(formData: FormData) {
  const locale = String(formData.get("locale") || "en");

  try {
    const title = String(formData.get("title") || "");
    const handle = String(formData.get("handle") || "");
    const description = String(formData.get("description") || "");
    const thumbnail = String(formData.get("thumbnail") || "");
    const referenceUrl = String(formData.get("referenceUrl") || "");
    const color = String(formData.get("color") || "");
    const storage = parseStorage(formData.get("storage"));
    const imei = parseImei(formData.get("imei"));
    const gradingData = parseGrade(formData.get("gradingData"));
    const batteryHealth = parseBatteryHealth(formData.get("batteryHealth"));
    const inventory = Number.parseInt(String(formData.get("inventory") || "0"), 10);
    const price = parsePriceToMinorUnits(String(formData.get("price") || ""));
    const status = parseStatus(formData.get("status"));

    await createAdminProduct({
      title,
      handle,
      description,
      thumbnail,
      referenceUrl,
      color,
      storage,
      imei,
      gradingData,
      batteryHealth,
      inventory,
      price,
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

  try {
    const title = String(formData.get("title") || "");
    const handle = String(formData.get("handle") || "");
    const description = String(formData.get("description") || "");
    const thumbnail = String(formData.get("thumbnail") || "");
    const referenceUrl = String(formData.get("referenceUrl") || "");
    const color = String(formData.get("color") || "");
    const storage = parseStorage(formData.get("storage"));
    const imei = parseImei(formData.get("imei"));
    const gradingData = parseGrade(formData.get("gradingData"));
    const batteryHealth = parseBatteryHealth(formData.get("batteryHealth"));
    const inventory = Number.parseInt(String(formData.get("inventory") || "0"), 10);
    const price = parsePriceToMinorUnits(String(formData.get("price") || ""));
    const status = parseStatus(formData.get("status"));

    await updateAdminProduct({
      productId,
      title,
      handle,
      description,
      thumbnail,
      referenceUrl,
      color,
      storage,
      imei,
      gradingData,
      batteryHealth,
      inventory,
      price,
      status,
    });

    revalidateAdminProductPaths(locale);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update product.";
    redirect(buildRedirectPath(locale, "error", message, productId));
  }

  redirect(buildRedirectPath(locale, "success", "Product updated successfully."));
}

export async function removeProductAction(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  const productId = String(formData.get("productId") || "");
  let removed = false;

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

  redirect(buildRedirectPath(locale, "success", "Product removed successfully."));
}
