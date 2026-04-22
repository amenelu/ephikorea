import { InfoPage } from "@/components/layout/info-page";
import { generateLocaleStaticParams } from "@/lib/locales";

export const generateStaticParams = generateLocaleStaticParams;

export default function AudioCollectionPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <InfoPage
      locale={locale}
      eyebrow="Collections"
      title="Audio Collection"
      description="Explore a demo range of premium listening gear curated for travelers, commuters, and everyday desk setups. This collection page gives the footer a dedicated landing page instead of sending every shopper to the same generic catalog."
      highlights={[
        "Noise-cancelling headphones and earbuds",
        "Portable speakers with premium finishes",
        "Editorial-style curation for demo merchandising",
      ]}
      sections={[
        {
          title: "Featured Gear",
          body: "Sample highlights include flagship wireless headphones, compact ANC earbuds, and speaker systems designed for minimal desks or mobile lifestyles. Use this area later for live collection rules or featured SKUs.",
        },
        {
          title: "Who It Fits",
          body: "This collection is ideal for customers shopping for work-from-anywhere setups, travel kits, or stylish everyday audio upgrades. It is also a good place to spotlight gift-friendly products during seasonal campaigns.",
        },
        {
          title: "Merchandising Note",
          body: "Right now the page contains demo content only. In production, you could connect this route to filtered product data, collection banners, and promotional messaging without changing the footer link structure.",
        },
      ]}
      primaryLink={{ href: `/${locale}/products`, label: "Browse all products" }}
      secondaryLink={{ href: `/${locale}/contact`, label: "Ask about availability" }}
    />
  );
}
