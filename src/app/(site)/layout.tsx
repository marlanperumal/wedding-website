import { SiteNavServer } from "@/components/ui/SiteNavServer";
import { Footer } from "@/components/ui/Footer";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteNavServer />
      <main>{children}</main>
      <Footer />
    </>
  );
}
