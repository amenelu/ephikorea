import { InfoPage } from "@/components/layout/info-page";

export default function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <InfoPage
      locale={locale}
      eyebrow="Support"
      title="Contact"
      description="Use this demo contact page for sales questions, order follow-ups, delivery issues, or sourcing requests. It gives the footer a real support destination while you decide how your live support inbox, forms, and SLAs should work."
      highlights={[
        "Sample response time: within 1 business day",
        "Support for orders, stock checks, and sourcing",
        "Guest checkout buyers can still get updates",
      ]}
      sections={[
        {
          title: "Sales Support",
          body: "Shoppers can use this channel to ask about product condition, battery health, color options, bundle availability, and business purchases before checking out.",
        },
        {
          title: "Order Assistance",
          body: "Existing customers can request updates on shipping, delivery timing, address changes, or return eligibility. In this demo setup, the admin panel already stores the buyer details needed to help them.",
        },
        {
          title: "Demo Contact Details",
          body: "Example email: support@amanmobile.demo. Example phone: +82 2-555-0188. Example showroom hours: Mon-Fri, 10:00-18:00 KST. Replace these with your real support details when ready.",
        },
      ]}
      primaryLink={{ href: `/${locale}/products`, label: "View products" }}
      secondaryLink={{ href: `/${locale}/cart`, label: "Go to checkout" }}
    />
  );
}
