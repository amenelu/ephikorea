import { InfoPage } from "@/components/layout/info-page";
import { generateLocaleStaticParams } from "@/lib/locales";

export const generateStaticParams = generateLocaleStaticParams;

export default function PrivacyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <InfoPage
      locale={locale}
      eyebrow="Company"
      title="Privacy Policy"
      description="This demo privacy policy explains the kind of customer information a modern electronics storefront would collect during browsing, checkout, and support interactions. Replace this copy with legal-reviewed text before launch."
      highlights={[
        "Basic checkout and contact details",
        "Operational use for orders and support",
        "Placeholder content for demo environments",
      ]}
      sections={[
        {
          title: "Information We Collect",
          body: "Aman Mobile may collect names, email addresses, phone numbers, delivery details, and order information when customers browse products, contact support, or place an order.",
        },
        {
          title: "How We Use It",
          body: "In a production version of the store, that information would be used to fulfill orders, provide shipping updates, answer support requests, improve storefront performance, and prevent misuse.",
        },
        {
          title: "Data Handling Note",
          body: "This page is sample content only. Real privacy terms should match your hosting setup, analytics tools, payment providers, cookie usage, and the laws that apply to your customers.",
        },
      ]}
      primaryLink={{ href: `/${locale}/contact`, label: "Privacy questions" }}
      secondaryLink={{ href: `/${locale}/products`, label: "Return to shopping" }}
    />
  );
}
