import { redirect } from "next/navigation";

export default function AccountPageRedirect({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/cart`);
}
