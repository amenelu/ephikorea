"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { completeAdminOrder } from "@/lib/admin-data";

function buildRedirectPath(
  locale: string,
  orderId: string,
  status: string,
  message: string,
) {
  const params = new URLSearchParams({ status, message });
  return `/${locale}/admin/orders/${orderId}?${params.toString()}`;
}

export async function completeOrderAction(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  const orderId = String(formData.get("orderId") || "");

  try {
    const updated = await completeAdminOrder(orderId);

    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/admin/orders`);
    revalidatePath(`/${locale}/admin/orders/${orderId}`);

    if (!updated) {
      redirect(
        buildRedirectPath(
          locale,
          orderId,
          "error",
          "Order is already completed or could not be updated.",
        ),
      );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to complete order.";
    redirect(buildRedirectPath(locale, orderId, "error", message));
  }

  redirect(
    buildRedirectPath(
      locale,
      orderId,
      "success",
      "Order marked as completed.",
    ),
  );
}
