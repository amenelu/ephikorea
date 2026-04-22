import { InfoPage } from "@/components/layout/info-page";
import { generateLocaleStaticParams } from "@/lib/locales";

export const generateStaticParams = generateLocaleStaticParams;

export default function ComputingCollectionPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <InfoPage
      locale={locale}
      eyebrow="Collections"
      title="Computing Collection"
      description="This demo computing collection is positioned around focused productivity, creative work, and premium everyday performance. It gives shoppers a clear landing page for laptops, tablets, accessories, and work-ready bundles."
      highlights={[
        "Portable productivity devices",
        "Accessories for desks and hybrid work",
        "Clean landing page for future filtering",
      ]}
      sections={[
        {
          title: "Product Focus",
          body: "Example inventory for this collection includes lightweight laptops, keyboard accessories, productivity tablets, monitors, and charging solutions. The goal is to present a cohesive work-and-create category instead of a flat product list.",
        },
        {
          title: "Shopping Context",
          body: "Use a collection page like this when customers arrive from campaigns centered on study, remote work, or business buying. It keeps navigation intuitive and gives you room for category-specific copy and promotions.",
        },
        {
          title: "Future Expansion",
          body: "Later, this route could show dynamic filters for storage, display size, battery health, and grade. For now, it serves as a polished placeholder with enough content to feel intentional in the footer.",
        },
      ]}
      primaryLink={{ href: `/${locale}/products`, label: "See the catalog" }}
      secondaryLink={{ href: `/${locale}/cart`, label: "Build a setup" }}
    />
  );
}
