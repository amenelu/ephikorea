import { InfoPage } from "@/components/layout/info-page";

export default function ShippingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <InfoPage
      locale={locale}
      eyebrow="Support"
      title="Shipping Information"
      description="Orders are processed through our storefront as soon as inventory is confirmed. Express fulfillment is prioritized for in-stock items, and tracking updates are shared using the buyer contact details collected during checkout."
    />
  );
}
