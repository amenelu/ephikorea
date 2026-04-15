import { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
