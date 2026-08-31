"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { List, MapIcon } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResortGrid } from "@/components/resort/resort-grid";
import { ResortMap, type MapResort } from "@/components/map/resort-map";
import type { ResortCardData } from "@/lib/data/resorts";

type Props = {
  resorts: ResortCardData[];
  favoritedIds?: Set<string>;
  isAuthenticated?: boolean;
};

export function SearchResults({ resorts, favoritedIds, isAuthenticated }: Props) {
  const t = useTranslations("SearchResults");
  const [view, setView] = useState<"list" | "map">("list");

  const mapResorts: MapResort[] = resorts.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    priceFrom: r.priceFrom,
    rating: r.rating,
    province: r.province,
    coverUrl: r.images[0]?.url,
    locationName: r.location?.name,
  }));

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <Tabs value={view} onValueChange={(v) => setView(v as "list" | "map")}>
          <TabsList>
            <TabsTrigger value="list">
              <List /> {t("list")}
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapIcon /> {t("map")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === "list" ? (
        <ResortGrid
          resorts={resorts}
          favoritedIds={favoritedIds}
          isAuthenticated={isAuthenticated}
          className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden scroll-smooth pb-4 sm:grid sm:grid-cols-2 sm:gap-x-5 sm:gap-y-8 sm:overflow-visible sm:pb-0 xl:grid-cols-3"
        />
      ) : (
        <ResortMap resorts={mapResorts} height="h-[640px]" />
      )}
    </div>
  );
}
