import { InfoPage } from "@/components/layout/info-page";
import { generateLocaleStaticParams } from "@/lib/locales";

export const generateStaticParams = generateLocaleStaticParams;

export default function WearablesCollectionPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <InfoPage
      locale={locale}
      eyebrow="Collections"
      title="Wearables Collection"
      description="The wearables collection is a demo destination for smart devices that blend health tracking, notifications, and minimal design. It gives the footer a real category page while keeping the current storefront simple."
      highlights={[
        "Smartwatches and fitness-focused devices",
        "Design-led accessories and bands",
        "Placeholder collection for future live inventory",
      ]}
      sections={[
        {
          title: "Collection Story",
          body: "This category is framed around tech that travels with the customer throughout the day, from work and workouts to sleep tracking and travel. It is useful when you want category pages to carry their own identity and tone.",
        },
        {
          title: "Example Merchandising",
          body: "A real version of this page could feature battery life callouts, wellness-focused bundles, compatibility notes, and seasonal accessory drops. That makes it stronger than linking every footer item to the same main catalog.",
        },
        {
          title: "Customer Use Cases",
          body: "Wearables shoppers often care about comfort, ecosystem compatibility, and charge life more than raw specs. This page gives you space to address that before they even open an individual product.",
        },
      ]}
      primaryLink={{ href: `/${locale}/products`, label: "Shop devices" }}
      secondaryLink={{ href: `/${locale}/about`, label: "Learn about the brand" }}
    />
  );
}
