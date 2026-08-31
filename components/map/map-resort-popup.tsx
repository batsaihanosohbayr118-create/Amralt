import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { RatingStars } from "@/components/resort/rating-stars";
import { formatMNT } from "@/lib/format";
import type { MapResort } from "@/components/map/resort-map";

type Props = {
  resort: MapResort;
  onNavigate: () => void;
};

export function MapResortPopup({ resort, onNavigate }: Props) {
  const t = useTranslations("MapResortPopup");
  return (
    <button
      type="button"
      onClick={onNavigate}
      className="flex w-56 flex-col overflow-hidden rounded-xl text-left"
    >
      {resort.coverUrl && (
        <div className="relative h-28 w-full">
          <Image
            src={resort.coverUrl}
            alt={resort.name}
            fill
            sizes="224px"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-1 p-2.5">
        <p className="font-heading text-sm font-semibold leading-snug text-foreground line-clamp-1">
          {resort.name}
        </p>
        <RatingStars rating={resort.rating} size="sm" />
        <p className="font-heading text-sm font-bold text-foreground">
          {formatMNT(resort.priceFrom)}
        </p>
        <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary">
          {t("viewDetails")} <ArrowRight className="size-3.5" />
        </span>
      </div>
    </button>
  );
}
