import { InfoPage } from "@/components/layout/info-page";

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
      description="Customer and order data should be handled through your Medusa backend policies and environment configuration. This placeholder policy page now gives users a stable destination while you finalize the production privacy copy."
    />
  );
}
