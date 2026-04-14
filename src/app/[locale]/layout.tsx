import { Header } from "@/components/layout/header";

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <div className="min-h-screen bg-white">
      <Header locale={locale} />
      <main>{children}</main>
    </div>
  );
}
