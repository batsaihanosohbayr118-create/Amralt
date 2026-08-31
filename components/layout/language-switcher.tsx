"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "mn", label: "MN" },
  { code: "en", label: "EN" },
] as const;

export function LanguageSwitcher({ transparent }: { transparent?: boolean }) {
  const locale = useLocale();
  const [isPending, setIsPending] = useState(false);

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
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-full border p-0.5 text-xs font-semibold",
        transparent
          ? "border-white/25 bg-white/10"
          : "border-border bg-secondary/50"
      )}
    >
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => switchLocale(l.code)}
          disabled={isPending}
          aria-pressed={locale === l.code}
          className={cn(
            "rounded-full px-2 py-1 transition-colors disabled:opacity-60",
            locale === l.code
              ? transparent
                ? "bg-white text-primary"
                : "bg-primary text-primary-foreground"
              : transparent
                ? "text-white/80 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
