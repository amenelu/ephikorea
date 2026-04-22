import { InfoPage } from "@/components/layout/info-page";
import { generateLocaleStaticParams } from "@/lib/locales";

export const generateStaticParams = generateLocaleStaticParams;

export default function ReturnsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <InfoPage
      locale={locale}
      eyebrow="Support"
      title="Returns Policy"
      description="This demo returns policy is written for a refurbished and premium electronics store where devices are inspected, graded, and shipped with care. Replace the timing and eligibility rules with your live support policy before launch."
      highlights={[
        "Example 7-day return request window",
        "Device condition checked before approval",
        "Support-led process for higher-value items",
      ]}
      sections={[
        {
          title: "Eligibility",
          body: "Returned items should be in the same condition they were delivered, including accessories and protective packaging where possible. Physical damage after delivery, missing parts, or account misuse would normally affect approval.",
        },
        {
          title: "Request Process",
          body: "Customers can contact support with their order number, reason for return, and photos if a product arrived with an issue. The support team then reviews the request and shares next steps for pickup or return shipping.",
        },
        {
          title: "Refund Timing",
          body: "Once the item is received and inspected, approved refunds would typically be processed to the original payment method. Actual timing depends on your payment provider, bank processing, and internal QA workflow.",
        },
      ]}
      primaryLink={{ href: `/${locale}/contact`, label: "Start a return" }}
      secondaryLink={{ href: `/${locale}/support/shipping`, label: "View shipping info" }}
    />
  );
}
