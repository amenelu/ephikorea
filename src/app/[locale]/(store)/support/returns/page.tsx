import { InfoPage } from "@/components/layout/info-page";

export default function ReturnsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <InfoPage
      locale={locale}
      eyebrow="Support"
      title="Returns Policy"
      description="Eligible returns can be requested after delivery through the support team. We recommend inspecting devices on arrival and keeping original packaging available until the order has been fully accepted."
    />
  );
}
