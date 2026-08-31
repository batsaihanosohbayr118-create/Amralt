import { useTranslations } from "next-intl";

import { ResortCard } from "@/components/resort/resort-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import type { ResortCardData } from "@/lib/data/resorts";

type Props = {
  resorts: ResortCardData[];
  favoritedIds?: Set<string>;
  isAuthenticated?: boolean;
  className?: string;
};

export function ResortGrid({
  resorts,
  favoritedIds,
  isAuthenticated = false,
  className,
}: Props) {
  const t = useTranslations("ResortGrid");
  if (resorts.length === 0) {
    return (
      <EmptyState
        title={t("noResortsTitle")}
        description={t("noResortsDescription")}
      />
    );
  }

  return (
    <div
      className={
        className ??
        "scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden scroll-smooth pb-4 sm:grid sm:grid-cols-2 sm:gap-x-5 sm:gap-y-8 sm:overflow-visible sm:pb-0 lg:grid-cols-3 xl:grid-cols-4"
      }
    >
      {resorts.map((resort, i) => (
        <ScrollReveal
          key={resort.id}
          delay={i * 100}
          className="min-w-[85%] shrink-0 snap-center first:ml-[7.5%] last:mr-[7.5%] sm:min-w-0 sm:shrink sm:first:ml-0 sm:last:mr-0"
        >
          <ResortCard
            resort={resort}
            isFavorited={favoritedIds?.has(resort.id)}
            isAuthenticated={isAuthenticated}
            priority={i < 4}
          />
        </ScrollReveal>
      ))}
    </div>
  );
}
