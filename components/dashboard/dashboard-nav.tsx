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
  icon: keyof typeof ICONS;
  exact?: boolean;
};

const ICONS: Record<string, LucideIcon> = {
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
  const ActiveIcon = activeItem ? ICONS[activeItem.icon] : MenuIcon;

  return (
    <>
      <nav className="hidden w-56 shrink-0 flex-col gap-1 lg:flex">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = ICONS[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="size-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

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
            const Icon = ICONS[item.icon];
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
