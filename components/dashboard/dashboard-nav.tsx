"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  BarChart3,
  Calendar,
  LayoutDashboard,
  Menu as MenuIcon,
  MessageSquare,
  Settings,
  TreePine,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: keyof typeof DASHBOARD_ICONS;
  exact?: boolean;
};

export const DASHBOARD_ICONS: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "tree-pine": TreePine,
  calendar: Calendar,
  "message-square": MessageSquare,
  "bar-chart-3": BarChart3,
  settings: Settings,
  users: Users,
};

export function DashboardNav({ items }: { items: DashboardNavItem[] }) {
  const t = useTranslations("DashboardShell");
  const pathname = usePathname();
  const activeItem = items.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  );
  const ActiveIcon = activeItem ? DASHBOARD_ICONS[activeItem.icon] : MenuIcon;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="mb-6 flex w-full items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground lg:hidden">
          <span className="flex items-center gap-2">
            <ActiveIcon className="size-4 text-primary" />
            {activeItem?.label ?? t("menu")}
          </span>
          <MenuIcon className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)]">
          {items.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = DASHBOARD_ICONS[item.icon];
            return (
              <DropdownMenuItem
                key={item.href}
                render={<Link href={item.href} />}
                className={cn(active && "bg-accent text-accent-foreground")}
              >
                <Icon />
                {item.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
