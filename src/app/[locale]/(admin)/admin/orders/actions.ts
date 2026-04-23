"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminActionAccess } from "@/lib/admin-auth";
import { toggleAdminOrderPaymentStatus } from "@/lib/admin-data";

function buildRedirectPath(locale: string, status: string, message: string) {
  const params = new URLSearchParams({ status, message });
  return `/${locale}/admin/orders?${params.toString()}`;
}

export async function toggleOrderPaymentStatusAction(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  const orderId = String(formData.get("orderId") || "");
  let redirectPath = buildRedirectPath(
    locale,
    "error",
    "Unable to update payment status.",
  );

  await requireAdminActionAccess(locale);

  try {
    const nextPaymentStatus = await toggleAdminOrderPaymentStatus(orderId);

    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/admin/orders`);
    revalidatePath(`/${locale}/admin/orders/${orderId}`);

    if (!nextPaymentStatus) {
      redirectPath = buildRedirectPath(
        locale,
        "error",
        "Unable to update payment status.",
      );
    } else {
      redirectPath = buildRedirectPath(
        locale,
        "success",
        nextPaymentStatus === "captured"
          ? "Order marked as paid."
          : "Order marked as unpaid.",
      );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update payment status.";
    redirectPath = buildRedirectPath(locale, "error", message);
  }

  redirect(redirectPath);
}
