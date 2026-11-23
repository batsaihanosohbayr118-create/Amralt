"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Minus, Plus, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import {
  ItinerarySkeleton,
  ItineraryView,
  SAVED_PLAN_KEY,
} from "@/components/ai/itinerary-view";
import type { ItineraryPlan } from "@/lib/itinerary/generate-itinerary";

type LocationOption = { slug: string; name: string };

// Quick interest tags. `keywords` are what the itinerary generator matches
// against amenities (see INTEREST_KEYWORDS), so tags work in every locale.
const INTEREST_TAGS = [
  { id: "adventure", keywords: "horse, fishing" },
  { id: "family", keywords: "family, kids" },
  { id: "horse", keywords: "horse" },
  { id: "nature", keywords: "nature" },
  { id: "fishing", keywords: "fishing" },
  { id: "relax", keywords: "sauna, relax" },
  { id: "campfire", keywords: "campfire" },
] as const;
type InterestTagId = (typeof INTEREST_TAGS)[number]["id"];

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  decreaseLabel,
  increaseLabel,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
}) {
  const btn =
    "flex size-9 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-primary/10 hover:text-primary active:scale-95 disabled:pointer-events-none disabled:opacity-35";
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex h-11 items-center justify-between rounded-xl border border-input bg-background px-1">
        <button
          type="button"
          className={btn}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`${decreaseLabel}: ${label}`}
        >
          <Minus className="size-4" />
        </button>
        <output
          className="min-w-8 text-center font-heading text-base font-semibold tabular-nums text-foreground"
          aria-live="polite"
        >
          {value}
        </output>
        <button
          type="button"
          className={btn}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`${increaseLabel}: ${label}`}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function TripPlannerForm({ locations }: { locations: LocationOption[] }) {
  const t = useTranslations("TripPlannerForm");
  const BUDGET_OPTIONS = [
    { value: "budget", label: t("budgetBudget") },
    { value: "mid", label: t("budgetMid") },
    { value: "luxury", label: t("budgetLuxury") },
  ];
  const [locationSlug, setLocationSlug] = useState(locations[0]?.slug ?? "");
  const [days, setDays] = useState(3);
  const [guests, setGuests] = useState(2);
  const [tags, setTags] = useState<InterestTagId[]>([]);
  const [budget, setBudget] = useState<string>("mid");
  const [interests, setInterests] = useState("");

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<ItineraryPlan | null>(null);
  const [isSavedCopy, setIsSavedCopy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Show the last saved plan (if any) until a new one is generated.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_PLAN_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { plan?: ItineraryPlan };
      if (saved.plan?.dayPlans) {
        // localStorage only exists in the browser, so this has to run after
        // hydration; reading it during render would mismatch the SSR markup.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPlan(saved.plan);
        setIsSavedCopy(true);
      }
    } catch {
      // ignore unreadable storage
    }
  }, []);

  // Bring a freshly generated plan into view (matters on mobile, where the
  // result sits below the form).
  useEffect(() => {
    if (plan && !loading && !isSavedCopy) {
      // Start a fresh plan from its top inside the scrolling panel…
      scrollRef.current?.scrollTo({ top: 0 });
      // …and on mobile (panel below the form) bring it into view.
      if (!window.matchMedia("(min-width: 1024px)").matches) {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [plan, loading, isSavedCopy]);

  const budgetLabel = plan?.budget
    ? (BUDGET_OPTIONS.find((o) => o.value === plan.budget)?.label ?? null)
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!locationSlug) {
      toast.error(t("selectLocationError"));
      return;
    }

    setLoading(true);
    setError(null);
    setPlan(null);
    setIsSavedCopy(false);

    try {
      const res = await fetch("/api/ai-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationSlug,
          days,
          guests,
          budget,
          interests: [
            interests.trim(),
            ...INTEREST_TAGS.filter((tag) => tags.includes(tag.id)).map(
              (tag) => tag.keywords
            ),
          ]
            .filter(Boolean)
            .join(", "),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.plan) {
        setError(data.error ?? t("genericError"));
        return;
      }
      setPlan(data.plan as ItineraryPlan);
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-6 lg:col-span-2"
      >
        <div className="space-y-1.5">
          <Label>{t("location")}</Label>
          <Select
            value={locationSlug}
            onValueChange={(value) => setLocationSlug(value ?? "")}
          >
            <SelectTrigger className="w-full rounded-xl px-3 data-[size=default]:h-11">
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
          <Stepper
            label={t("numberOfDays")}
            value={days}
            min={1}
            max={14}
            onChange={setDays}
            decreaseLabel={t("decrease")}
            increaseLabel={t("increase")}
          />
          <Stepper
            label={t("numberOfGuests")}
            value={guests}
            min={1}
            max={20}
            onChange={setGuests}
            decreaseLabel={t("decrease")}
            increaseLabel={t("increase")}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t("budget")}</Label>
          <div className="flex gap-2">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={budget === opt.value}
                onClick={() => setBudget(opt.value)}
                className={cn(
                  "h-11 flex-1 rounded-xl border px-3 text-sm font-medium transition-all active:scale-95",
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

        <div className="space-y-2">
          <Label>{t("interestsLabel")}</Label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_TAGS.map((tag) => {
              const selected = tags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    setTags((cur) =>
                      selected ? cur.filter((x) => x !== tag.id) : [...cur, tag.id]
                    )
                  }
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {selected && <Check className="size-3.5" />}
                  {t(`tags.${tag.id}`)}
                </button>
              );
            })}
          </div>
          <Textarea
            rows={3}
            maxLength={200}
            placeholder={t("interestsPlaceholder")}
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
        </div>

        <Button type="submit" className="h-11 w-full rounded-xl text-sm font-semibold" disabled={loading}>
          {loading ? (
            t("planning")
          ) : (
            <>
              <Wand2 /> {t("generatePlan")}
            </>
          )}
        </Button>
      </form>

      {/* On lg the panel is taken out of flow (absolute), so the row height
          comes from the form alone and the plan scrolls inside the panel. */}
      <div className="relative lg:col-span-3">
        <div className="relative min-h-[400px] overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-[#e2f2e9] shadow-sm lg:absolute lg:inset-0 lg:min-h-0 dark:border-emerald-900/40 dark:from-emerald-950/50 dark:to-emerald-950/20">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              maskImage: "radial-gradient(ellipse at top right, black, transparent 70%)",
            }}
          />
          <div className="pointer-events-none absolute -right-14 -top-14 size-56 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 size-48 rounded-full bg-emerald-400/15 blur-3xl" />

          <div
            ref={scrollRef}
            className="relative h-full overscroll-contain p-4 [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin] sm:p-6 lg:overflow-y-auto"
          >
            {!plan && !loading && !error && (
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

            {loading && (
              <div>
                <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="size-4 animate-pulse text-primary" />
                  {t("processing")}
                </p>
                <ItinerarySkeleton />
              </div>
            )}

            {plan && !loading && (
              <div ref={resultRef} className="scroll-mt-24">
                <ItineraryView
                  key={plan.title + plan.guests + plan.budget + String(isSavedCopy)}
                  plan={plan}
                  budgetLabel={budgetLabel}
                  isSavedCopy={isSavedCopy}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
