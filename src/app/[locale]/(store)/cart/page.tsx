import CartClient from "@/components/cart/cart-client";
import { getCheckoutCountries } from "@/lib/checkout";
import { submitCheckoutAction } from "./actions";

export default async function CartPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { status?: string; message?: string };
}) {
  const countries = await getCheckoutCountries();

  return (
    <CartClient
      locale={locale}
      status={searchParams.status}
      message={searchParams.message}
      checkoutAction={submitCheckoutAction}
      countries={countries}
    />
  );
}
