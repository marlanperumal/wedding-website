import type { Metadata } from "next";
import { Parisienne, Cormorant_Garamond, Cinzel } from "next/font/google";
import "./globals.css";
import { SiteNavServer } from "@/components/ui/SiteNavServer";
import { Footer } from "@/components/ui/Footer";

const parisienne = Parisienne({
  variable: "--font-parisienne",
  subsets: ["latin"],
  weight: ["400"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Marlan & Tramaine — November 2026",
  description:
    "Join us to celebrate our wedding in Cape Town, November 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${parisienne.variable} ${cormorant.variable} ${cinzel.variable}`}
    >
      <body className="bg-paper text-ink antialiased">
        <SiteNavServer />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
