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
    pathname: "/support/shipping",
    title: "Shipping Info",
    description: "See how fast we ship and where we deliver.",
  });
}

export default function ShippingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <InfoPage
      locale={locale}
      eyebrow="Support"
      title="Shipping Info"
      description="Most in-stock orders ship within 1-2 business days. We'll email or text you as soon as your order is on its way, and every item is packed carefully so it arrives in one piece."
      highlights={[
        "Ships in 1-2 business days",
        "We'll let you know as soon as it ships",
        "Careful packaging for every item",
      ]}
      sections={[
        {
          title: "Processing Times",
          body: "Order before noon and we'll usually get it ready the same day. Items that need one last check or extra parts may ship the next business day instead.",
        },
        {
          title: "Delivery Coverage",
          body: "We deliver to major cities now, with regional and select international shipping available depending on the item.",
        },
      ]}
      primaryLink={{ href: `/${locale}/cart`, label: "Start an Order" }}
      secondaryLink={{
        href: `/${locale}/contact`,
        label: "Ask About Delivery",
      }}
    />
  );
}
