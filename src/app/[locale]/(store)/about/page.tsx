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
    pathname: "/about",
    title: "About Us",
    description:
      "Learn how Aman Mobiles checks and grades every product we sell, so you always know what you're buying.",
  });
}

export default function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <InfoPage
      locale={locale}
      eyebrow="Company"
      title="About Aman Mobiles"
      description="Buying tech online shouldn't feel like a gamble. That's why everything we sell - new or certified pre-owned - gets checked and graded before it ever reaches you, so you know exactly what you're paying for."
      highlights={[
        "New and certified pre-owned, always clearly labeled",
        "Shop in Korean or English, whichever's easier for you",
        "Simple ordering, clear pricing, and real people to help",
      ]}
      sections={[
        {
          title: "What You'll Find Here",
          body: "Phones, audio, computing, wearables, and everyday accessories - we focus on tech that's actually worth trusting. Every listing tells you the real condition and grade, so there's no surprise when it arrives.",
        },
        {
          title: "Why Buy From Us",
          body: "We inspect and grade every item ourselves before it's listed, so the description matches what shows up at your door. If something's not right, our support team sorts it out - no runaround.",
        },
      ]}
      primaryLink={{ href: `/${locale}/products`, label: "Shop Collection" }}
      secondaryLink={{ href: `/${locale}/contact`, label: "Get in Touch" }}
    />
  );
}
