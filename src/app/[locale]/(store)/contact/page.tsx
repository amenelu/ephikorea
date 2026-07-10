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
    pathname: "/contact",
    title: "Contact Us",
    description:
      "Questions about an order or a product? Contact Aman Mobiles support -- most replies within 1 business day.",
  });
}

export default function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <InfoPage
      locale={locale}
      eyebrow="Support"
      title="Get in Touch"
      description="Got a question about an order, a product you're considering, or anything else? Reach out -- we usually reply within 1 business day."
      sections={[
        {
          title: "Before You Buy",
          body: "Ask us about condition, battery health, color options, bundles, or bulk orders -- happy to help before you check out.",
        },
        {
          title: "After You Order",
          body: "Already ordered? We can help with delivery timing, address changes, or return requests.",
        },
        {
          title: "Contact Details",
          body: "Email: [your real support email] Phone: [your real support number] Hours: [your real showroom/support hours]",
        },
      ]}
      primaryLink={{ href: `/${locale}/products`, label: "Shop Collection" }}
      secondaryLink={{ href: `/${locale}/cart`, label: "Go to Checkout" }}
    />
  );
}
