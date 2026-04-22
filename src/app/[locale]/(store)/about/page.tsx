import { InfoPage } from "@/components/layout/info-page";
import { generateLocaleStaticParams } from "@/lib/locales";

export const generateStaticParams = generateLocaleStaticParams;

export default function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <InfoPage
      locale={locale}
      eyebrow="Company"
      title="About Aman Mobile"
      description="Aman Mobile is a demo premium electronics storefront built to showcase polished merchandising, localized browsing, and admin-managed commerce operations. The brand story here is fictional, but the customer journey is designed to feel like a modern retail launch."
      highlights={[
        "Curated refurbished and premium electronics",
        "Localized browsing for Korean and English shoppers",
        "Admin-managed catalog, orders, and customer data",
      ]}
      sections={[
        {
          title: "What We Sell",
          body: "The demo catalog focuses on premium consumer tech including mobile devices, audio gear, and everyday productivity hardware. Each product page is meant to feel editorial instead of purely transactional.",
        },
        {
          title: "How It Runs",
          body: "The storefront is powered by Next.js on the frontend with Medusa handling the commerce backend. That makes it a good starter foundation for adding real payments, shipping rules, and customer accounts later.",
        },
        {
          title: "Why It Exists",
          body: "This project gives you a realistic base for testing catalog design, order flows, and admin tooling without waiting for final production copy. It is intentionally set up so placeholder content can evolve into a live brand site.",
        },
      ]}
      primaryLink={{ href: `/${locale}/products`, label: "Explore the catalog" }}
      secondaryLink={{ href: `/${locale}/contact`, label: "Talk to the team" }}
    />
  );
}
