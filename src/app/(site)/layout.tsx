import { SiteNavServer } from "@/components/ui/SiteNavServer";
import { Footer } from "@/components/ui/Footer";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Column layout so short pages push the footer to the bottom of the
    // viewport instead of leaving it stranded mid-screen.
    <div className="flex min-h-dvh flex-col">
      <SiteNavServer />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
