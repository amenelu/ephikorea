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
    pathname: "/sustainability",
    title: "Sustainability",
    description:
      "Learn how refurbishing and grading products at Aman Mobiles helps them last longer.",
  });
}

export default function SustainabilityPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <InfoPage
      locale={locale}
      eyebrow="Company"
      title="Doing Right by Your Devices"
      description="Buying refurbished means fewer working devices end up sitting in a drawer or a landfill. We carefully grade and refurbish every item so it gets a longer life instead of an early replacement."
      highlights={[
        "Refurbishment extends a device's useful life",
        "Packaging chosen to cut down on waste",
        "Clear grading so you buy once, confidently",
      ]}
      sections={[
        {
          title: "Longer Device Lifecycles",
          body: "By properly refurbishing and grading devices, we help good products stay in use longer instead of getting replaced too soon - which means less electronic waste overall.",
        },
        {
          title: "How We Try to Do Better",
          body: "We reuse packaging where we can, choose right-sized boxes to cut down on waste, and give clear grading details upfront - so you don't need to over-order or return something that wasn't what you expected.",
        },
      ]}
      primaryLink={{ href: `/${locale}/products`, label: "Shop Collection" }}
      secondaryLink={{ href: `/${locale}/privacy`, label: "View Our Policies" }}
    />
  );
}
