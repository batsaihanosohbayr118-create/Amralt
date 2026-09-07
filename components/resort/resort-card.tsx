import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Navigation } from "lucide-react";

import { RatingStars } from "@/components/resort/rating-stars";
import { FavoriteButton } from "@/components/resort/favorite-button";
import { CompareToggle } from "@/components/resort/compare-toggle";
import { formatKm, formatMNT } from "@/lib/format";
import { localizedName, localizedProvince } from "@/lib/i18n-content";
import type { ResortCardData } from "@/lib/data/resorts";
import type { Locale } from "@/i18n/request";

type Props = {
  resort: ResortCardData;
  isFavorited?: boolean;
  isAuthenticated?: boolean;
  priority?: boolean;
  showCompare?: boolean;
};

export function ResortCard({
  resort,
  isFavorited = false,
  isAuthenticated = false,
  priority = false,
  showCompare = true,
}: Props) {
  const t = useTranslations("ResortCard");
  const tCategory = useTranslations("CategoryLabels");
  const locale = useLocale() as Locale;
  const cover = resort.images[0]?.url;
  const resortName = localizedName(locale, resort.name, resort.nameEn, resort.nameZh);
  const locationName = resort.location
    ? localizedName(locale, resort.location.name, resort.location.nameEn, resort.location.nameZh)
    : localizedProvince(locale, resort.province);

  const categoryLabel = resort.category
    ? tCategory.has(resort.category.slug)
      ? tCategory(resort.category.slug)
      : resort.category.name
    : null;

  return (
    <Link
      href={`/resorts/${resort.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-card transition-all duration-300 ease-out hover:shadow-xl hover:shadow-black/10"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-muted">
        {cover ? (
          <Image
            src={cover}
            alt={resortName}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {categoryLabel ? (
            <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
              {categoryLabel}
            </span>
          ) : (
            <span />
          )}
          <FavoriteButton
            resortId={resort.id}
            initialFavorited={isFavorited}
            isAuthenticated={isAuthenticated}
          />
        </div>

        {showCompare && (
          <div className="absolute inset-x-0 bottom-0 flex justify-start p-3">
            <CompareToggle resortId={resort.id} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 px-1 py-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading font-semibold leading-snug text-foreground line-clamp-1">
            {resortName}
          </h3>
          <RatingStars rating={resort.rating} size="sm" />
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="line-clamp-1">
            {locationName}
          </span>
        </div>

        {resort.distanceFromUbKm != null && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Navigation className="size-3.5 shrink-0" />
            <span>{t("distanceFromUb", { distance: formatKm(resort.distanceFromUbKm, locale) })}</span>
          </div>
        )}

        <div className="mt-1 flex items-baseline gap-1">
          <span className="font-heading text-lg font-bold text-primary">
            {formatMNT(resort.priceFrom, locale)}
          </span>
          <span className="text-sm text-muted-foreground">{t("perNight")}</span>
        </div>
      </div>
    </Link>
  );
}