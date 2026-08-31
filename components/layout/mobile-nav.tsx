"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Heart, Home, Map, Search, User } from "lucide-react";

import { cn } from "@/lib/utils";

export function MobileNav() {
  const t = useTranslations("MobileNav");
  const pathname = usePathname();
  const { status } = useSession();

  const ITEMS = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/search", label: t("search"), icon: Search },
    { href: "/map", label: t("map"), icon: Map },
    { href: "/favorites", label: t("favorites"), icon: Heart },
    { href: "/profile", label: t("profile"), icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      <div className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const target =
            (item.href === "/favorites" || item.href === "/profile") &&
            status !== "authenticated"
              ? "/login"
              : item.href;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={target}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
