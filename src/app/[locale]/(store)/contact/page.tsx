import { InfoPage } from "@/components/layout/info-page";

export default function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <InfoPage
      locale={locale}
      eyebrow="Support"
      title="Contact"
      description="For order questions, delivery updates, and product availability, use the guest checkout flow or reach out to the admin-managed support workflow. This storefront now keeps buyer contact details directly from checkout instead of requiring account sign-in."
    />
  );
}
