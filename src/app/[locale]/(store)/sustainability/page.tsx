import { InfoPage } from "@/components/layout/info-page";
import { generateLocaleStaticParams } from "@/lib/locales";

export const generateStaticParams = generateLocaleStaticParams;

export default function SustainabilityPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <InfoPage
      locale={locale}
      eyebrow="Company"
      title="Sustainability"
      description="This demo sustainability page explains how a premium electronics storefront might talk about refurbishment, lifecycle extension, and more responsible packaging. It is sample brand content that you can replace with real metrics later."
      highlights={[
        "Refurbishment extends product life",
        "Packaging designed to reduce waste",
        "Placeholder ESG copy for brand storytelling",
      ]}
      sections={[
        {
          title: "Longer Device Lifecycles",
          body: "Aman Mobile positions refurbishment and careful grading as part of a lower-waste retail model. Extending the useful life of high-quality electronics can reduce unnecessary replacement cycles and keep premium devices in active use longer.",
        },
        {
          title: "Operational Practices",
          body: "Example sustainability practices include reusable packing materials where possible, right-sized shipping boxes, and clearer grading notes so customers can buy with confidence instead of over-ordering and returning multiple devices.",
        },
        {
          title: "Important Note",
          body: "This is demo content only and should not be treated as a verified sustainability claim. Before publishing live, replace it with evidence-backed information about sourcing, refurbishment standards, logistics, and measurable goals.",
        },
      ]}
      primaryLink={{ href: `/${locale}/products`, label: "Shop responsibly" }}
      secondaryLink={{ href: `/${locale}/privacy`, label: "View company policy" }}
    />
  );
}
