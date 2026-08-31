import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

import { DashboardNav, type DashboardNavItem } from "@/components/dashboard/dashboard-nav";

type Props = {
  brand: string;
  navItems: DashboardNavItem[];
  children: React.ReactNode;
};

export function DashboardShell({ brand, navItems, children }: Props) {
  const t = useTranslations("DashboardShell");
  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> {t("back")}
        </Link>
        <h1 className="mt-1 font-heading text-2xl font-bold text-foreground">
          {brand}
        </h1>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <DashboardNav items={navItems} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
