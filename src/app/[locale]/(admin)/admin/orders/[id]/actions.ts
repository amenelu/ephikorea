"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminActionAccess } from "@/lib/admin-auth";
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
  let result: "updated" | "already_completed" = "already_completed";
  let redirectPath = buildRedirectPath(
    locale,
    orderId,
    "error",
    "Unable to complete order.",
  );
  await requireAdminActionAccess(locale);

  try {
    result = await completeAdminOrder(orderId);

    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/admin/orders`);
    revalidatePath(`/${locale}/admin/orders/${orderId}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to complete order.";
    redirectPath = buildRedirectPath(locale, orderId, "error", message);
  }

  if (redirectPath.includes("status=error")) {
    redirect(redirectPath);
  }

  redirectPath =
    result === "already_completed"
      ? buildRedirectPath(
          locale,
          orderId,
          "success",
          "Order was already marked as completed.",
        )
      : buildRedirectPath(
          locale,
          orderId,
          "success",
          "Order marked as completed.",
        );

  redirect(redirectPath);
}
