import { getTranslations } from "next-intl/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const t = await getTranslations("AdminLayout");

  const NAV_ITEMS = [
    { href: "/admin", label: t("navOverview"), icon: "layout-dashboard" as const, exact: true },
    { href: "/admin/resorts", label: t("navResorts"), icon: "tree-pine" as const },
    { href: "/admin/users", label: t("navUsers"), icon: "users" as const },
  ];

  return (
    <DashboardShell brand={t("brand")} navItems={NAV_ITEMS}>
      {children}
    </DashboardShell>
  );
}
