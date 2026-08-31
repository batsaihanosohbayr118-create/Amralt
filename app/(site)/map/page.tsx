import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { getResortsForMap } from "@/lib/data/resorts";
import { parseResortFilters, type RawSearchParams } from "@/lib/search-params";
import { ResortMap } from "@/components/map/resort-map";
import { localizedName } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/request";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MapPageMetadata");
  return { title: t("title"), description: t("description") };
}

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const t = await getTranslations("MapPage");
  const locale = (await getLocale()) as Locale;
  const rawParams = await searchParams;
  const filters = parseResortFilters(rawParams);
  const resorts = await getResortsForMap(filters);

  const mapResorts = resorts.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: localizedName(locale, r.name, r.nameEn),
    latitude: r.latitude,
    longitude: r.longitude,
    priceFrom: r.priceFrom,
    rating: r.rating,
    province: r.province,
    coverUrl: r.images[0]?.url,
    locationName: r.location
      ? localizedName(locale, r.location.name, r.location.nameEn)
      : undefined,
  }));

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-4">
        <div className="pointer-events-auto rounded-full border border-border/60 bg-card/95 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur">
          {t("resortsOnMap", { count: mapResorts.length })}
        </div>
      </div>
      <ResortMap
        resorts={mapResorts}
        height="h-full"
        className="rounded-none"
        groupByProvince
      />
    </div>
  );
}
