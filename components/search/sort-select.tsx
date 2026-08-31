"use client";

import { useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useFilterParams } from "@/lib/hooks/use-filter-params";

export function SortSelect() {
  const t = useTranslations("SortSelect");
  const OPTIONS = [
    { value: "popular", label: t("popular") },
    { value: "rating", label: t("rating") },
    { value: "price_asc", label: t("priceAsc") },
    { value: "price_desc", label: t("priceDesc") },
    { value: "distance", label: t("distance") },
  ];

  const { searchParams, setParam } = useFilterParams();
  const sort = searchParams.get("sort") ?? "popular";
  const selectedOption = OPTIONS.find((option) => option.value === sort);

  return (
    <Select value={sort} onValueChange={(value) => setParam("sort", value)}>
      <SelectTrigger className="w-[200px]">
        <span>{selectedOption?.label ?? t("sortBy")}</span>
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
