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
) {
  const params = new URLSearchParams({ status, message });

  if (edit) {
    params.set("edit", edit);
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
    const inventory = Number.parseInt(String(formData.get("inventory") || "0"), 10);
    const price = parsePriceToMinorUnits(String(formData.get("price") || ""));
    const status = parseStatus(formData.get("status"));

    await createAdminProduct({
      title,
      handle,
      description,
      thumbnail,
      inventory,
      price,
      status,
    });

    revalidateAdminProductPaths(locale);
    redirect(buildRedirectPath(locale, "success", "Product added successfully."));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to add product.";
    redirect(buildRedirectPath(locale, "error", message));
  }
}

export async function updateProductAction(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  const productId = String(formData.get("productId") || "");

  try {
    const title = String(formData.get("title") || "");
    const handle = String(formData.get("handle") || "");
    const description = String(formData.get("description") || "");
    const thumbnail = String(formData.get("thumbnail") || "");
    const inventory = Number.parseInt(String(formData.get("inventory") || "0"), 10);
    const price = parsePriceToMinorUnits(String(formData.get("price") || ""));
    const status = parseStatus(formData.get("status"));

    await updateAdminProduct({
      productId,
      title,
      handle,
      description,
      thumbnail,
      inventory,
      price,
      status,
    });

    revalidateAdminProductPaths(locale);
    redirect(buildRedirectPath(locale, "success", "Product updated successfully."));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update product.";
    redirect(buildRedirectPath(locale, "error", message, productId));
  }
}

export async function removeProductAction(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  const productId = String(formData.get("productId") || "");

  try {
    const removed = await removeAdminProduct(productId);

    revalidateAdminProductPaths(locale);

    if (!removed) {
      redirect(buildRedirectPath(locale, "error", "Product was not found."));
    }

    redirect(buildRedirectPath(locale, "success", "Product removed successfully."));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to remove product.";
    redirect(buildRedirectPath(locale, "error", message));
  }
}
