import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CompareBar } from "@/components/search/compare-bar";
import { SiteChrome } from "@/components/layout/site-chrome";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteChrome
      header={<Header />}
      compareBar={<CompareBar />}
      mobileNav={<MobileNav />}
    >
      {children}
    </SiteChrome>
  );
}
