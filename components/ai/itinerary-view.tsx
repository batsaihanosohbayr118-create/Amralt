"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Car,
  ChevronRight,
  CloudSun,
  Download,
  ImageOff,
  Info,
  MapPin,
  Moon,
  Share2,
  Star,
  Sun,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  ItineraryPlan,
  PlanResort,
  TimeSlot,
} from "@/lib/itinerary/generate-itinerary";

export const SAVED_PLAN_KEY = "amralt:saved-plan";

// White cards floating on the planner's pale-green panel: hairline border
// plus a soft, green-tinted shadow for depth.
const CARD =
  "rounded-2xl border border-emerald-950/[0.06] bg-card shadow-[0_1px_2px_rgba(16,40,30,0.05),0_8px_24px_-12px_rgba(16,94,60,0.20)] dark:border-white/10";
const CARD_HOVER =
  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(16,40,30,0.06),0_16px_32px_-12px_rgba(16,94,60,0.30)]";

const SLOT_ICONS: Record<TimeSlot, LucideIcon> = {
  travel: Car,
  morning: Sun,
  afternoon: CloudSun,
  evening: Moon,
};


function ResortThumb({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("relative shrink-0 overflow-hidden bg-emerald-50 dark:bg-emerald-950/40", className)}>
      {src && !failed ? (
        // `unoptimized`: load straight from the source so hosts that block
        // the Next image proxy (e.g. Google photos) still work in the browser.
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes="160px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground">
          <ImageOff className="size-5" />
        </div>
      )}
    </div>
  );
}

function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
      <Star className="size-3.5 fill-amber-400 text-amber-400" />
      {value.toFixed(1)}
      {count ? (
        <span className="font-normal text-muted-foreground">({count})</span>
      ) : null}
    </span>
  );
}

function Pill({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
      <Icon className="size-3.5" />
      {children}
    </span>
  );
}


function openPrintWindow(plan: ItineraryPlan, heading: string) {
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return false;
  const doc = w.document;
  doc.title = plan.title;

  const style = doc.createElement("style");
  style.textContent = `
    body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #10231a; margin: 40px; line-height: 1.6; }
    h1 { font-size: 22px; margin: 0 0 4px; color: #0b5d3b; }
    .sub { color: #5b6b63; font-size: 13px; margin-bottom: 24px; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
    @page { margin: 18mm; }
  `;
  doc.head.appendChild(style);

  const h1 = doc.createElement("h1");
  h1.textContent = plan.title;
  const sub = doc.createElement("div");
  sub.className = "sub";
  sub.textContent = heading;
  // Plan text is rendered with textContent, never as HTML.
  const pre = doc.createElement("pre");
  pre.textContent = plan.text.split("\n").slice(2).join("\n");
  doc.body.append(h1, sub, pre);

  w.focus();
  setTimeout(() => w.print(), 150);
  return true;
}

/* ------------------------------------------------------------------ */

export function ItineraryView({
  plan,
  budgetLabel,
  isSavedCopy = false,
}: {
  plan: ItineraryPlan;
  budgetLabel: string | null;
  isSavedCopy?: boolean;
}) {
  const t = useTranslations("ItineraryView");
  const [saved, setSaved] = useState(isSavedCopy);

  const meta = [
    t("guests", { count: plan.guests }),
    t("days", { count: plan.days }),
    budgetLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  function handleSave() {
    try {
      localStorage.setItem(SAVED_PLAN_KEY, JSON.stringify({ plan, budgetLabel }));
      setSaved(true);
      toast.success(t("saved"));
    } catch {
      toast.error(t("saveFailed"));
    }
  }

  async function handleShare() {
    const text = plan.text;
    if (navigator.share) {
      try {
        await navigator.share({ title: plan.title, text });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("copied"));
    } catch {
      toast.error(t("shareFailed"));
    }
  }

  function handlePdf() {
    if (!openPrintWindow(plan, meta)) toast.error(t("popupBlocked"));
  }

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className={cn(CARD, "p-5")}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {isSavedCopy && (
              <p className="mb-1 text-xs font-medium text-primary">
                {t("savedPlanNotice")}
              </p>
            )}
            <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">
              {plan.title}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill icon={Users}>{t("guests", { count: plan.guests })}</Pill>
              <Pill icon={CalendarDays}>{t("days", { count: plan.days })}</Pill>
              {budgetLabel && <Pill icon={Wallet}>{budgetLabel}</Pill>}
            </div>
          </div>

          <div className="flex shrink-0 gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              className="rounded-lg"
              aria-label={t("save")}
            >
              {saved ? <BookmarkCheck className="text-primary" /> : <Bookmark />}
              <span className="hidden sm:inline">{t("save")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="rounded-lg"
              aria-label={t("share")}
            >
              <Share2 />
              <span className="hidden sm:inline">{t("share")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePdf}
              className="rounded-lg"
              aria-label={t("pdf")}
            >
              <Download />
              <span className="hidden sm:inline">{t("pdf")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Recommended resort */}
      <Link
        href={`/resorts/${plan.primary.slug}`}
        className={cn(CARD, CARD_HOVER, "group flex gap-4 border-primary/20 p-3 hover:border-primary/40")}
      >
        <ResortThumb
          src={plan.primary.image}
          alt={plan.primary.name}
          className="h-24 w-28 rounded-xl sm:w-36"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <span className="w-fit rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
            {t("recommended")}
          </span>
          <p className="truncate font-heading font-semibold text-foreground">
            {plan.primary.name}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <Rating value={plan.primary.rating} count={plan.primary.reviewCount} />
            {plan.primary.priceLabel && (
              <span>
                <span className="font-semibold text-foreground">
                  {t("from", { price: plan.primary.priceLabel })}
                </span>{" "}
                {t("perNight")}
              </span>
            )}
            {plan.primary.distanceLabel && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {t("distance", { km: plan.primary.distanceLabel })}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="size-5 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>

      {/* Timeline */}
      <ol className="space-y-4">
        {plan.dayPlans.map((day, i) => (
          <li key={day.day} className="relative pl-12">
            {i < plan.dayPlans.length - 1 && (
              <span
                aria-hidden
                className="absolute top-11 -bottom-4 left-[19px] w-0.5 rounded-full bg-gradient-to-b from-primary/40 to-primary/10"
              />
            )}
            <span className="absolute top-1 left-0 flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-500 font-heading text-sm font-bold text-white shadow-md shadow-primary/25 ring-4 ring-emerald-50 dark:ring-emerald-950">
              {day.day}
            </span>

            <div className={cn(CARD, "p-4")}>
              <p className="text-[11px] font-semibold tracking-wider text-primary uppercase">
                {t("dayLabel", { day: day.day })}
              </p>
              <h3 className="font-heading font-semibold text-foreground">
                {day.title}
              </h3>

              <ul className="mt-3 space-y-3">
                {day.items.map((item, j) => {
                  const Icon = SLOT_ICONS[item.slot];
                  return (
                    <li key={j} className="flex gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-xs font-medium text-muted-foreground">
                          {t(`slot.${item.slot}`)}
                        </p>
                        <p className="text-sm leading-relaxed text-foreground first-letter:uppercase">
                          {item.text}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {day.note && (
                <p className="mt-3 flex gap-2 rounded-xl bg-emerald-50/80 p-3 text-xs leading-relaxed text-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-100/70">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  {day.note}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* Cost */}
      {plan.cost && (
        <div className={cn(CARD, "flex gap-4 p-4")}>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40">
            <Wallet className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              {t("costTitle")}
            </p>
            <p className="font-heading text-xl font-bold text-foreground tabular-nums">
              {plan.cost.total}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{plan.cost.line}</p>
            <p className="mt-1 text-xs text-muted-foreground/80">{plan.cost.note}</p>
          </div>
        </div>
      )}

      {/* Alternatives */}
      {plan.alternatives.length > 0 && (
        <div>
          <h3 className="mb-3 font-heading text-sm font-semibold text-foreground">
            {t("alternatives")}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {plan.alternatives.map((r) => (
              <AlternativeCard key={r.slug} resort={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AlternativeCard({ resort }: { resort: PlanResort }) {
  const t = useTranslations("ItineraryView");
  return (
    <Link
      href={`/resorts/${resort.slug}`}
      className={cn(CARD, CARD_HOVER, "group flex items-center gap-3 p-2.5 hover:border-primary/30")}
    >
      <ResortThumb src={resort.image} alt={resort.name} className="size-16 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{resort.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <Rating value={resort.rating} />
          <span>
            {resort.priceLabel
              ? `${t("from", { price: resort.priceLabel })} ${t("perNight")}`
              : t("priceUnknown")}
          </span>
        </div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function ItinerarySkeleton() {
  return (
    <div className="space-y-5" aria-hidden>
      <div className="h-28 animate-pulse rounded-2xl bg-white/70 dark:bg-white/5" />
      <div className="h-28 animate-pulse rounded-2xl bg-white/60 dark:bg-white/5" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3">
          <div className="size-10 shrink-0 animate-pulse rounded-full bg-white/70 dark:bg-white/5" />
          <div className="h-32 flex-1 animate-pulse rounded-2xl bg-white/50 dark:bg-white/5" />
        </div>
      ))}
    </div>
  );
}
