"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { submitGuestOrder } from "@/lib/checkout";

type CheckoutSnapshotItem = {
  variantId: string;
  quantity: number;
};

function buildRedirectPath(locale: string, status: string, message: string) {
  const params = new URLSearchParams({ status, message });
  return `/${locale}/cart?${params.toString()}`;
}

export async function submitCheckoutAction(formData: FormData) {
  const locale = String(formData.get("locale") || "en");
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const phone = String(formData.get("phone") || "");
  const address1 = String(formData.get("address1") || "");
  const address2 = String(formData.get("address2") || "");
  const city = String(formData.get("city") || "");
  const province = String(formData.get("province") || "");
  const postalCode = String(formData.get("postalCode") || "");
  const countryCode = String(formData.get("countryCode") || "");
  const rawItems = String(formData.get("cartSnapshot") || "[]");
  const items = JSON.parse(rawItems) as CheckoutSnapshotItem[];

  try {
    await submitGuestOrder({
      name,
      email,
      phone,
      address1,
      address2,
      city,
      province,
      postalCode,
      countryCode,
      items,
    });

    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/admin/customers`);
    revalidatePath(`/${locale}/admin/orders`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit checkout.";
    redirect(buildRedirectPath(locale, "error", message));
  }

  redirect(
    buildRedirectPath(
      locale,
      "success",
      "Order submitted successfully. Our team can now process it for delivery.",
    ),
  );
}
