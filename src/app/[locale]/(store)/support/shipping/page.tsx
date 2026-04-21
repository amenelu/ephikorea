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
      description="This demo shipping page outlines a premium fulfillment experience for local and international electronics orders. Use it as a placeholder until your final courier, dispatch timing, and regional pricing rules are ready."
      highlights={[
        "1-2 business days for in-stock dispatch",
        "Tracking shared by email or phone",
        "Premium packaging for sensitive devices",
      ]}
      sections={[
        {
          title: "Processing Times",
          body: "Orders placed before midday are typically prepared the same day in this demo flow. Devices that require final inspection, grading confirmation, or accessory bundling may ship on the next business day.",
        },
        {
          title: "Delivery Coverage",
          body: "Example coverage includes major Korean metro areas, regional delivery nationwide, and selected international destinations. Final availability should depend on your carrier integrations and customs requirements.",
        },
        {
          title: "Tracking Updates",
          body: "Customers receive shipment updates through the contact details provided during checkout. That gives guest checkout buyers the same visibility as account-based shoppers without forcing sign-in.",
        },
      ]}
      primaryLink={{ href: `/${locale}/cart`, label: "Start an order" }}
      secondaryLink={{ href: `/${locale}/contact`, label: "Ask about delivery" }}
    />
  );
}
