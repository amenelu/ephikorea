import { InfoPage } from "@/components/layout/info-page";
import { generateLocaleStaticParams } from "@/lib/locales";
import { buildPageMetadata } from "@/lib/seo";

export const generateStaticParams = generateLocaleStaticParams;

export function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return buildPageMetadata({
    locale,
    pathname: "/support/returns",
    title: "Returns Policy",
    description:
      "Learn how returns work at Aman Mobiles, including our 7-day window and refund process.",
  });
}

export default function ReturnsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <InfoPage
      locale={locale}
      eyebrow="Support"
      title="Returns"
      description="Changed your mind, or something's not right? You can request a return within 7 days of delivery. We'll check the item's condition before approving, and our team personally handles anything higher-value."
      highlights={[
        "7-day return window",
        "Condition checked before approval",
        "Support team handles higher-value items directly",
      ]}
      sections={[
        {
          title: "Eligibility",
          body: "Send the item back in the same condition it arrived - with all original accessories and packaging where possible. Items that are damaged, missing parts, or show signs of misuse may not qualify.",
        },
        {
          title: "How to Request a Return",
          body: "Contact us with your order number, the reason for the return, and photos if something arrived damaged. We'll review it and let you know the next steps for sending it back.",
        },
        {
          title: "Refund Timing",
          body: "Once we receive and check your return, we'll refund your original payment method. The exact timing depends on your bank or payment provider.",
        },
      ]}
      primaryLink={{ href: `/${locale}/contact`, label: "Start a Return" }}
      secondaryLink={{
        href: `/${locale}/support/shipping`,
        label: "View Shipping Info",
      }}
    />
  );
}
