"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AmenityIcon } from "@/components/amenity-icon";
import { useFilterParams } from "@/lib/hooks/use-filter-params";
import { cn } from "@/lib/utils";

type Props = {
  provinces: string[];
  amenities: { slug: string; name: string; icon: string }[];
  className?: string;
};

export function FilterSidebar({ provinces, amenities, className }: Props) {
  const t = useTranslations("FilterSidebar");
  const amenityT = useTranslations("AmenityLabels");
  const { searchParams, setParam, toggleListParam, clearAll } = useFilterParams();

  const ACCOMMODATION_TYPES = [
    { value: "GER", label: t("typeGer") },
    { value: "FAMILY_HOUSE", label: t("typeFamilyHouse") },
    { value: "VIP_HOUSE", label: t("typeVipHouse") },
  ];

  const RATING_OPTIONS = [
    { value: "4.5", label: "4.5+" },
    { value: "4", label: "4.0+" },
    { value: "3.5", label: "3.5+" },
  ];

  const DISTANCE_OPTIONS = [
    { value: "100", label: t("distanceUnder", { km: 100 }) },
    { value: "300", label: t("distanceUnder", { km: 300 }) },
    { value: "600", label: t("distanceUnder", { km: 600 }) },
  ];

  const province = searchParams.get("province") ?? "";
  const rating = searchParams.get("rating") ?? "";
  const distance = searchParams.get("distance") ?? "";
  const selectedTypes = searchParams.get("type")?.split(",").filter(Boolean) ?? [];
  const selectedAmenities =
    searchParams.get("amenities")?.split(",").filter(Boolean) ?? [];

  const hasActiveFilters = Array.from(searchParams.keys()).some(
    (k) => !["q", "location", "sort", "checkIn", "checkOut"].includes(k)
  );

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          {t("title")}
        </h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              clearAll(["q", "location", "sort", "checkIn", "checkOut"])
            }
          >
            <X /> {t("clear")}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t("province")}</Label>
        <Select
          value={province}
          onValueChange={(value) => setParam("province", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("allProvinces")} />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("rating")}</Label>
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setParam("rating", rating === opt.value ? null : opt.value)
              }
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                rating === opt.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-secondary"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("distanceFromUb")}</Label>
        <div className="flex flex-wrap gap-2">
          {DISTANCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setParam("distance", distance === opt.value ? null : opt.value)
              }
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                distance === opt.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-secondary"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("accommodationType")}</Label>
        <div className="space-y-2.5">
          {ACCOMMODATION_TYPES.map((type) => (
            <label
              key={type.value}
              className="flex cursor-pointer items-center gap-2.5 text-sm"
            >
              <Checkbox
                checked={selectedTypes.includes(type.value)}
                onCheckedChange={() => toggleListParam("type", type.value)}
              />
              {type.label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("amenities")}</Label>
        <div className="space-y-2.5">
          {amenities.map((amenity) => (
            <label
              key={amenity.slug}
              className="flex cursor-pointer items-center gap-2.5 text-sm"
            >
              <Checkbox
                checked={selectedAmenities.includes(amenity.slug)}
                onCheckedChange={() =>
                  toggleListParam("amenities", amenity.slug)
                }
              />
              <AmenityIcon
                name={amenity.icon}
                className="size-4 text-muted-foreground"
              />
              {amenityT(amenity.slug)}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
