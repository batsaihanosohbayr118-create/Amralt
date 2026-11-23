import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

import { DashboardNav, type DashboardNavItem } from "@/components/dashboard/dashboard-nav";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

type Props = {
  brand: string;
  navItems: DashboardNavItem[];
  children: React.ReactNode;
};

export function DashboardShell({ brand, navItems, children }: Props) {
  const t = useTranslations("DashboardShell");
  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar items={navItems} brand={brand} />

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> {t("back")}
          </Link>
        </div>

        {/* Mobile / tablet menu (the sidebar takes over from lg up) */}
        <DashboardNav items={navItems} />

        {children}
      </main>
    </div>
  );
}
