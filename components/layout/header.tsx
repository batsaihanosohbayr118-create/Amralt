"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Heart, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("Header");
  const { data: session } = useSession();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const NAV_LINKS = [
    { href: "/", label: t("navHome") },
    { href: "/search", label: t("navSearch") },
    { href: "/map", label: t("navMap") },
  ];

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!isHome) return;
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const transparent = isHome && !scrolled;

  return (
    <header
      className={cn(
        "inset-x-0 top-0 z-40 transition-colors duration-300",
        isHome ? "fixed" : "sticky",
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-border/60 bg-background/85 backdrop-blur-md"
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 transition-colors duration-300 sm:px-6 lg:px-8",
          transparent ? "text-white" : "text-foreground"
        )}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo-icon.png"
            alt=""
            width={250}
            height={270}
            priority
            className="h-9 w-auto"
          />
          <span
            className={cn(
              "font-heading text-xl font-bold tracking-tight transition-colors duration-300",
              transparent ? "text-white" : "text-foreground"
            )}
          >
            Amralt
            <span
              className={transparent ? "text-emerald-300" : "text-emerald-700"}
            >
              .mn
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group relative px-3 py-2 text-sm font-medium transition-colors",
                transparent
                  ? "text-white/90 hover:text-white"
                  : "text-foreground/80 hover:text-foreground"
              )}
            >
              {link.label}
              <span
                className={cn(
                  "pointer-events-none absolute inset-x-3 -bottom-px h-0.5 origin-center scale-x-0 rounded-full transition-transform duration-300 ease-out group-hover:scale-x-100",
                  transparent ? "bg-emerald-300" : "bg-primary"
                )}
              />
            </Link>
          ))}

          <Link
            href="/ai-planner"
            className="group relative ml-1 flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-primary to-emerald-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 active:scale-95"
          >
            <Sparkles className="size-4 transition-transform duration-500 group-hover:rotate-[20deg] group-hover:scale-110" />
            {t("aiPlanner")}
            <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 blur-sm transition-transform duration-700 ease-out group-hover:translate-x-[350%]" />
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher transparent={transparent} />

          <Link
            href="/ai-planner"
            aria-label={t("aiPlanner")}
            className="group relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-primary to-emerald-500 text-white shadow-sm transition-transform active:scale-95 md:hidden"
          >
            <Sparkles className="size-4" />
          </Link>

          {session?.user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:inline-flex"
                nativeButton={false}
                render={<Link href="/favorites" aria-label={t("favorites")} />}
              >
                <Heart />
              </Button>
              <UserMenu user={session.user} />
            </>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                className="px-2 text-xs sm:px-4 sm:text-sm"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                {t("login")}
              </Button>
              <Button
                className="bg-emerald-700 px-2 text-xs text-white shadow-sm hover:bg-emerald-800 sm:px-4 sm:text-sm"
                nativeButton={false}
                render={<Link href="/register" />}
              >
                {t("register")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
