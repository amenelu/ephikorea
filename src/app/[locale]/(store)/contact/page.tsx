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
      description="For order questions, account help, and product availability, use your account portal or the admin-managed support workflow. This storefront is now wired so contact navigation lands on a real page instead of a dead placeholder."
    />
  );
}
