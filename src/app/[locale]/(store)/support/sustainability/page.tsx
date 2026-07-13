import { permanentRedirect } from "next/navigation";

import { generateLocaleStaticParams } from "@/lib/locales";

export const generateStaticParams = generateLocaleStaticParams;

export default function SupportSustainabilityRedirect({
  params: { locale },
}: {
  params: { locale: string };
}) {
  permanentRedirect(`/${locale}/sustainability`);
}
