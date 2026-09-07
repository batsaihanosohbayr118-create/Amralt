"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { CountryFlag } from "@/components/ui/country-flag";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function flagUrl(code: string) {
  return `https://flagcdn.com/${code}.svg`;
}

const LOCALES = [
  { code: "mn", label: "MN", name: "Монгол", flag: flagUrl("mn") },
  { code: "en", label: "EN", name: "English", flag: flagUrl("gb") },
  { code: "zh", label: "中", name: "中文", flag: flagUrl("cn") },
] as const;

export function LanguageSwitcher({ transparent }: { transparent?: boolean }) {
  const locale = useLocale();
  const [isPending, setIsPending] = useState(false);
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  async function switchLocale(next: string) {
    if (next === locale || isPending) return;
    setIsPending(true);
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });
    // A full reload guarantees every Server Component (including the root
    // layout, which owns the NextIntlClientProvider messages) re-renders
    // with the new locale — router.refresh() alone left the header stale.
    window.location.reload();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        aria-label="Language"
        className={cn(
          "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-60",
          transparent
            ? "border-white/25 bg-white/10 text-white/90 hover:text-white"
            : "border-border bg-secondary/50 text-foreground hover:bg-secondary"
        )}
      >
        <CountryFlag src={current.flag} />
        {current.label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {LOCALES.map((l) => (
          <DropdownMenuItem key={l.code} onClick={() => switchLocale(l.code)}>
            <CountryFlag src={l.flag} />
            <span className="flex-1">{l.name}</span>
            {locale === l.code && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
