import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function StoreLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header locale={locale} />
      <main className="flex-grow">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
