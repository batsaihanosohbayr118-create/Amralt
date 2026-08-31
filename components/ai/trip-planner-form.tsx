"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type LocationOption = { slug: string; name: string };

export function TripPlannerForm({ locations }: { locations: LocationOption[] }) {
  const t = useTranslations("TripPlannerForm");
  const BUDGET_OPTIONS = [
    { value: "budget", label: t("budgetBudget") },
    { value: "mid", label: t("budgetMid") },
    { value: "luxury", label: t("budgetLuxury") },
  ];
  const [locationSlug, setLocationSlug] = useState(locations[0]?.slug ?? "");
  const [days, setDays] = useState("3");
  const [guests, setGuests] = useState("2");
  const [budget, setBudget] = useState<string>("mid");
  const [interests, setInterests] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!locationSlug) {
      toast.error(t("selectLocationError"));
      return;
    }

    setLoading(true);
    setError(null);
    setResult("");

    try {
      const res = await fetch("/api/ai-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationSlug,
          days: Number(days),
          guests: Number(guests),
          budget,
          interests,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? t("genericError"));
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setResult(accumulated);
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-2">
        <div className="space-y-1.5">
          <Label>{t("location")}</Label>
          <Select
            value={locationSlug}
            onValueChange={(value) => setLocationSlug(value ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectRegion")}>
                {(value: string | null) =>
                  locations.find((l) => l.slug === value)?.name ??
                  t("selectRegion")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.slug} value={loc.slug}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t("numberOfDays")}</Label>
            <Input
              type="number"
              className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              min={1}
              max={14}
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("numberOfGuests")}</Label>
            <Input
              type="number"
              className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              min={1}
              max={20}
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t("budget")}</Label>
          <div className="flex gap-2">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setBudget(opt.value)}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                  budget === opt.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t("interestsLabel")}</Label>
          <Textarea
            rows={3}
            placeholder={t("interestsPlaceholder")}
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full rounded-xl" disabled={loading}>
          {loading ? (
            t("planning")
          ) : (
            <>
              <Wand2 /> {t("generatePlan")}
            </>
          )}
        </Button>
      </form>

      <div className="lg:col-span-3">
        <div className="relative min-h-[400px] overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-emerald-50 via-card to-primary/5 p-6 shadow-sm dark:from-primary/10 dark:via-card dark:to-emerald-500/5">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              maskImage: "radial-gradient(ellipse at top right, black, transparent 70%)",
            }}
          />
          <div className="pointer-events-none absolute -right-14 -top-14 size-56 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 size-48 rounded-full bg-emerald-400/15 blur-3xl" />

          <div className="relative">
            {!result && !loading && !error && (
              <div className="flex h-full min-h-[350px] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="size-7" />
                </span>
                <p className="max-w-xs text-sm">
                  {t("emptyStateHint")}
                </p>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            {loading && !result && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="size-4 animate-pulse text-primary" />
                {t("processing")}
              </div>
            )}

            {result && (
              <div
                ref={resultRef}
                className="whitespace-pre-line text-sm leading-relaxed text-foreground"
              >
                {result}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
