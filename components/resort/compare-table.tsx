import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";

import { RatingStars } from "@/components/resort/rating-stars";
import { AmenityIcon } from "@/components/amenity-icon";
import { formatKm, formatMNT } from "@/lib/format";
import type { getResortsByIds } from "@/lib/data/resorts";

type Resort = Awaited<ReturnType<typeof getResortsByIds>>[number];

export function CompareTable({ resorts }: { resorts: Resort[] }) {
  const t = useTranslations("CompareTable");
  const amenityT = useTranslations("AmenityLabels");
  const amenitySet = new Map<string, { name: string; icon: string }>();
  for (const resort of resorts) {
    for (const { amenity } of resort.amenities) {
      amenitySet.set(amenity.slug, amenity);
    }
  }
  const amenityList = Array.from(amenitySet.entries());

  return (
    <div className="scrollbar-hide overflow-x-auto scroll-smooth">
      <table className="w-full min-w-0 table-fixed border-separate border-spacing-0 sm:min-w-[640px]">
        <thead>
          <tr>
            <th className="hidden w-20 p-2 text-left text-sm font-medium text-muted-foreground sm:table-cell sm:w-40 sm:p-3">
              {t("feature")}
            </th>
            {resorts.map((resort) => (
              <th key={resort.id} className="w-1/2 p-2 text-left align-top sm:w-56 sm:p-3">
                <Link href={`/resorts/${resort.slug}`} className="block">
                  <div className="relative h-20 w-full overflow-hidden rounded-2xl bg-muted sm:h-28">
                    {resort.images[0] && (
                      <Image
                        src={resort.images[0].url}
                        alt={resort.name}
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <p className="mt-2 font-heading text-sm font-semibold text-foreground hover:text-primary">
                    {resort.name}
                  </p>
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-border/60">
            <td className="hidden p-3 text-sm font-medium text-muted-foreground sm:table-cell">{t("price")}</td>
            {resorts.map((resort) => (
              <td key={resort.id} className="p-3 text-sm font-semibold text-foreground">
                  <span className="mb-1 block text-xs font-medium text-muted-foreground sm:hidden">
                    {t("price")}
                  </span>
                {formatMNT(resort.priceFrom)}
              </td>
            ))}
          </tr>
          <tr className="border-t border-border/60">
            <td className="hidden p-3 text-sm font-medium text-muted-foreground sm:table-cell">
              {t("rating")}
            </td>
            {resorts.map((resort) => (
              <td key={resort.id} className="p-3">
                <span className="mb-1 block text-xs font-medium text-muted-foreground sm:hidden">
                  {t("rating")}
                </span>
                <RatingStars rating={resort.rating} size="sm" />
              </td>
            ))}
          </tr>
          <tr className="border-t border-border/60">
            <td className="hidden p-3 text-sm font-medium text-muted-foreground sm:table-cell">
              {t("distanceFromUb")}
            </td>
            {resorts.map((resort) => (
              <td key={resort.id} className="p-3 text-sm text-foreground">
                <span className="mb-1 block text-xs font-medium text-muted-foreground sm:hidden">
                  {t("distanceFromUb")}
                </span>
                {resort.distanceFromUbKm != null
                  ? formatKm(resort.distanceFromUbKm)
                  : "—"}
              </td>
            ))}
          </tr>
          <tr className="border-t border-border/60">
            <td className="hidden p-3 text-sm font-medium text-muted-foreground sm:table-cell">
              {t("location")}
            </td>
            {resorts.map((resort) => (
              <td key={resort.id} className="p-3 text-sm text-foreground">
                <span className="mb-1 block text-xs font-medium text-muted-foreground sm:hidden">
                  {t("location")}
                </span>
                {resort.location?.name ?? resort.province}
              </td>
            ))}
          </tr>
          {amenityList.map(([slug, amenity]) => (
            <tr key={slug} className="border-t border-border/60">
              <td className="hidden items-center gap-2 p-3 text-sm font-medium text-muted-foreground sm:flex">
                <AmenityIcon name={amenity.icon} className="size-4" />
                {amenityT(slug)}
              </td>
              {resorts.map((resort) => {
                const has = resort.amenities.some(
                  (a) => a.amenity.slug === slug
                );
                return (
                  <td key={resort.id} className="p-3">
                    <span className="mb-1 block text-xs font-medium text-muted-foreground sm:hidden">
                      {amenityT(slug)}
                    </span>
                    {has ? (
                      <Check className="size-4 text-primary" />
                    ) : (
                      <X className="size-4 text-muted-foreground/40" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
