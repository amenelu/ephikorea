import CartClient from "@/components/cart/cart-client";
import { submitCheckoutAction } from "./actions";

export default async function CartPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { status?: string; message?: string };
}) {
  return (
    <CartClient
      locale={locale}
      status={searchParams.status}
      message={searchParams.message}
      checkoutAction={submitCheckoutAction}
    />
  );
}
