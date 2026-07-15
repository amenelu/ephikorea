"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminActionAccess } from "@/lib/admin-auth";
import { createFinanceExpense, deleteFinanceExpense } from "@/lib/finance-data";

function buildRedirectPath(locale: string, status: string, message: string) {
  const params = new URLSearchParams({ status, message });
  return `/${locale}/admin/finance?${params.toString()}`;
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

function parseAmountToMinorUnits(rawValue: string, currencyCode: string) {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    throw new Error("Amount is required.");
  }

  if (currencyCode === "krw") {
    if (!/^\d+$/.test(trimmed)) {
      throw new Error("KRW amount must be a whole number.");
    }

    return Number.parseInt(trimmed, 10);
  }

  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    throw new Error("Amount must be a valid number with up to 2 decimals.");
  }

  return Math.round(Number(trimmed) * 100);
}

export async function addFinanceExpenseAction(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  await requireAdminActionAccess(locale);

  try {
    const currencyCode = parseCurrencyCode(formData.get("currencyCode"));

    await createFinanceExpense({
      expenseDate: String(formData.get("expenseDate") || ""),
      category: String(formData.get("category") || ""),
      amount: parseAmountToMinorUnits(
        String(formData.get("amount") || ""),
        currencyCode,
      ),
      currencyCode,
      note: String(formData.get("note") || ""),
    });

    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/admin/finance`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to add expense.";
    redirect(buildRedirectPath(locale, "error", message));
  }

  redirect(buildRedirectPath(locale, "success", "Expense added."));
}

export async function deleteFinanceExpenseAction(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  await requireAdminActionAccess(locale);

  try {
    await deleteFinanceExpense(String(formData.get("expenseId") || ""));

    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/admin/finance`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete expense.";
    redirect(buildRedirectPath(locale, "error", message));
  }

  redirect(buildRedirectPath(locale, "success", "Expense removed."));
}
