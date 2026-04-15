import { InfoPage } from "@/components/layout/info-page";

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
      description="Aman Mobile combines a premium storefront with Medusa-powered commerce operations. The current site focuses on a clean catalog, localized browsing, and a checkout flow that can evolve into a more complete production storefront."
    />
  );
}
