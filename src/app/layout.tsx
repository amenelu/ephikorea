import { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/provider";

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
