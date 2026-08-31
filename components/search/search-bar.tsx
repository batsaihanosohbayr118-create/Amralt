"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MapPin, Minus, Plus, Search, Users, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type LocationOption = { slug: string; name: string };

type Props = {
  locations: LocationOption[];
  className?: string;
  compact?: boolean;
  initialLocationSlug?: string;
  initialGuests?: number;
  initialDuration?: number;
  initialBudget?: number;
  initialLandscape?: string;
};

export function SearchBar({
  locations,
  className,
  compact = false,
  initialLocationSlug = "",
  initialGuests = 2,
  initialDuration = 2,
  initialBudget = 500000,
  initialLandscape = "",
}: Props) {
  const t = useTranslations("SearchBar");
  const LANDSCAPE_OPTIONS = [
    { value: "steppe", label: t("landscapeSteppe") },
    { value: "khangai", label: t("landscapeKhangai") },
    { value: "lake", label: t("landscapeLake") },
    { value: "water", label: t("landscapeWater") },
  ];

  const router = useRouter();
  const [locationSlug, setLocationSlug] = useState<string>(initialLocationSlug);
  const [landscape, setLandscape] = useState(initialLandscape);
  const [guests, setGuests] = useState(initialGuests);
  const [duration, setDuration] = useState(initialDuration);
  const [budget, setBudget] = useState(initialBudget);

  const selectedLocation = locations.find((loc) => loc.slug === locationSlug);
  const selectedLandscape = LANDSCAPE_OPTIONS.find(
    (option) => option.value === landscape
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (locationSlug) params.set("location", locationSlug);
    if (landscape) params.set("landscape", landscape);
    if (duration) params.set("duration", String(duration));
    if (budget) params.set("budget", String(budget));
    if (guests) params.set("guests", String(guests));
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full flex-col gap-2 rounded-3xl border border-border/60 bg-card/95 p-2.5 shadow-xl shadow-black/5 backdrop-blur md:flex-row md:items-center md:gap-1 md:rounded-full",
        compact && "shadow-none md:rounded-2xl",
        className
      )}
    >
      <div className="flex flex-1 items-center gap-2.5 rounded-2xl px-3 py-2 md:rounded-full md:hover:bg-secondary/60">
        <MapPin className="size-4.5 shrink-0 text-muted-foreground" />
        <Select
          value={locationSlug}
          onValueChange={(value) => setLocationSlug(value ?? "")}
        >
          <SelectTrigger className="h-auto w-full border-0 p-0 shadow-none focus-visible:ring-0 text-sm">
            <span className={cn("flex-1 text-left", !selectedLocation && "text-muted-foreground")}>
              {selectedLocation?.name ?? t("location")}
            </span>
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

      <div className="hidden h-8 w-px bg-border md:block" />

      <div className="flex flex-1 items-center gap-2.5 rounded-2xl px-3 py-2 md:rounded-full md:hover:bg-secondary/60">
        <Select value={landscape} onValueChange={(value) => setLandscape(value ?? "")}>
          <SelectTrigger className="h-auto w-full border-0 p-0 shadow-none focus-visible:ring-0 text-sm">
            <span className={cn("flex-1 text-left", !selectedLandscape && "text-muted-foreground")}>
              {selectedLandscape?.label ?? t("landscape")}
            </span>
          </SelectTrigger>
          <SelectContent>
            {LANDSCAPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="hidden h-8 w-px bg-border md:block" />

      <Popover>
        <PopoverTrigger className="flex flex-1 items-center gap-2.5 rounded-2xl px-3 py-2 text-left md:rounded-full md:hover:bg-secondary/60">
          <Wallet className="size-4.5 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm">{budget.toLocaleString("mn-MN")}₮</span>
        </PopoverTrigger>
        <PopoverContent className="w-64 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">{t("totalBudget")}</label>
            <Select value={String(budget)} onValueChange={(value) => setBudget(Number(value))}>
              <SelectTrigger className="w-full">
                <span>{budget.toLocaleString("mn-MN")}₮</span>
              </SelectTrigger>
              <SelectContent>
                {[200000, 500000, 1000000, 2000000, 5000000].map((value) => (
                  <SelectItem key={value} value={String(value)}>{value.toLocaleString("mn-MN")}₮</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">{t("howManyDays")}</label>
            <Select value={String(duration)} onValueChange={(value) => setDuration(Number(value))}>
              <SelectTrigger className="w-full">
                <span>{t("days", { count: duration })}</span>
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 5, 7, 10].map((value) => (
                  <SelectItem key={value} value={String(value)}>{t("days", { count: value })}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>

      <div className="hidden h-8 w-px bg-border md:block" />

      <Popover>
        <PopoverTrigger className="flex flex-1 items-center gap-2.5 rounded-2xl px-3 py-2 text-left md:rounded-full md:hover:bg-secondary/60">
          <Users className="size-4.5 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm">{t("guestsCount", { count: guests })}</span>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("guests")}</span>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-7 rounded-full hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
              >
                <Minus className="size-3.5" />
              </Button>
              <span className="w-4 text-center text-sm font-medium">
                {guests}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-7 rounded-full hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
                onClick={() => setGuests((g) => Math.min(20, g + 1))}
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        type="submit"
        size={compact ? "default" : "lg"}
        className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 md:ml-1"
      >
        <Search className="md:hidden" />
        {t("search")}
      </Button>
    </form>
  );
}
