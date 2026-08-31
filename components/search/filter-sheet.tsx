"use client";

import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterSidebar } from "@/components/search/filter-sidebar";
import { useFilterParams } from "@/lib/hooks/use-filter-params";

type Props = {
  provinces: string[];
  amenities: { slug: string; name: string; icon: string }[];
};

export function FilterSheet({ provinces, amenities }: Props) {
  const t = useTranslations("FilterSidebar");
  const { searchParams } = useFilterParams();
  const activeCount = Array.from(searchParams.keys()).filter(
    (k) => !["q", "location", "sort", "checkIn", "checkOut", "page"].includes(k)
  ).length;

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" className="relative lg:hidden" />
        }
      >
        <SlidersHorizontal />
        {t("title")}
        {activeCount > 0 && (
          <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="scrollbar-hide max-h-[85vh] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <FilterSidebar provinces={provinces} amenities={amenities} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
