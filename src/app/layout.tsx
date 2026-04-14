import { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/provider";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Aman mobile | Premium Technology",
  description:
    "Discover innovative technology and premium devices at Aman mobile.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
