"use client";

import { Scale } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { useCompareList } from "@/lib/hooks/use-compare-list";
import { cn } from "@/lib/utils";

export function CompareToggle({ resortId }: { resortId: string }) {
  const t = useTranslations("CompareToggle");
  const { ids, toggle, maxItems } = useCompareList();
  const selected = ids.includes(resortId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!selected && ids.length >= maxItems) {
      toast.error(t("maxItemsError", { maxItems }));
      return;
    }
    toggle(resortId);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-transparent bg-background/90 text-foreground hover:bg-background"
      )}
    >
      <Scale className="size-3.5" />
      {selected ? t("selected") : t("compare")}
    </button>
  );
}