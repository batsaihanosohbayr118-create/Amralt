"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ControlPosition,
  InfoWindow,
  Map,
  MapControl,
  Marker,
  useMap,
} from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { Marker as ClustererMarker } from "@googlemaps/markerclusterer";
import { ArrowLeft } from "lucide-react";

import { MapProvider } from "@/components/map/map-provider";
import { MapResortPopup } from "@/components/map/map-resort-popup";
import { AimagBoundaries } from "@/components/map/aimag-boundaries";
import { createPricePinIcon, createProvinceIcon } from "@/lib/maps/marker-icon";
import { MONGOLIA_CENTER, MONGOLIA_DEFAULT_ZOOM } from "@/lib/maps/config";
import { cn } from "@/lib/utils";

export type MapResort = {
  id: string;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  priceFrom: number;
  rating: number;
  province: string;
  coverUrl?: string | null;
  locationName?: string | null;
};

type Props = {
  resorts: MapResort[];
  className?: string;
  height?: string;
  /** Show one marker per province first; clicking drills down to that province's resorts. */
  groupByProvince?: boolean;
};

export function ResortMap({
  resorts,
  className,
  height = "h-[520px]",
  groupByProvince = false,
}: Props) {
  return (
    <MapProvider className={cn(height, className)}>
      <div className={cn("overflow-hidden rounded-3xl", height, className)}>
        <Map
          defaultCenter={MONGOLIA_CENTER}
          defaultZoom={MONGOLIA_DEFAULT_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI
          zoomControl
          fullscreenControl
          className="h-full w-full"
        >
          {groupByProvince ? (
            <ProvinceDrillMarkers resorts={resorts} />
          ) : (
            <ResortMarkers resorts={resorts} />
          )}
        </Map>
      </div>
    </MapProvider>
  );
}

function ProvinceDrillMarkers({ resorts }: { resorts: MapResort[] }) {
  const t = useTranslations("ResortMap");
  const map = useMap();
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [hovered, setHovered] = useState<{ name: string; count: number } | null>(
    null
  );

  const provinceGroups = useMemo(() => {
    const groups = new globalThis.Map<string, MapResort[]>();
    for (const r of resorts) {
      const list = groups.get(r.province) ?? [];
      list.push(r);
      groups.set(r.province, list);
    }
    return Array.from(groups.entries()).map(([province, items]) => ({
      province,
      items,
      center: {
        lat: items.reduce((sum, r) => sum + r.latitude, 0) / items.length,
        lng: items.reduce((sum, r) => sum + r.longitude, 0) / items.length,
      },
    }));
  }, [resorts]);

  const countByProvince = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const group of provinceGroups) counts[group.province] = group.items.length;
    return counts;
  }, [provinceGroups]);

  useEffect(() => {
    if (!map || selectedProvince || resorts.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    resorts.forEach((r) => bounds.extend({ lat: r.latitude, lng: r.longitude }));
    map.fitBounds(bounds, 64);
  }, [map, selectedProvince, resorts]);

  if (selectedProvince) {
    const group = provinceGroups.find((g) => g.province === selectedProvince);
    return (
      <>
        <MapControl position={ControlPosition.TOP_LEFT}>
          <button
            type="button"
            onClick={() => setSelectedProvince(null)}
            className="m-3 flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-md transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="size-4" /> {t("allProvinces")}
          </button>
        </MapControl>
        <ResortMarkers resorts={group?.items ?? []} />
      </>
    );
  }

  return (
    <>
      <AimagBoundaries
        countByProvince={countByProvince}
        onSelectProvince={setSelectedProvince}
        onHoverProvince={setHovered}
      />

      {hovered && (
        <MapControl position={ControlPosition.TOP_LEFT}>
          <div className="m-3 rounded-full border border-border/60 bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-md">
            {hovered.name} · {t("resortCount", { count: hovered.count })}
          </div>
        </MapControl>
      )}

      {provinceGroups.map((group) => (
        <Marker
          key={group.province}
          position={group.center}
          icon={createProvinceIcon(group.province, group.items.length)}
          title={`${group.province} (${group.items.length})`}
          onClick={() => setSelectedProvince(group.province)}
        />
      ))}
    </>
  );
}

function ResortMarkers({ resorts }: { resorts: MapResort[] }) {
  const map = useMap();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedAnchor, setSelectedAnchor] =
    useState<google.maps.Marker | null>(null);
  const markersRef = useRef<Record<string, google.maps.Marker>>({});
  const clustererRef = useRef<MarkerClusterer | null>(null);

  useEffect(() => {
    if (!map) return;
    clustererRef.current?.setMap(null);
    clustererRef.current = new MarkerClusterer({ map });
    return () => {
      clustererRef.current?.setMap(null);
      clustererRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    if (!clustererRef.current) return;
    clustererRef.current.clearMarkers();
    clustererRef.current.addMarkers(
      Object.values(markersRef.current) as ClustererMarker[]
    );
  }, [resorts]);

  useEffect(() => {
    if (!map || resorts.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    resorts.forEach((r) => bounds.extend({ lat: r.latitude, lng: r.longitude }));
    map.fitBounds(bounds, 64);
  }, [map, resorts]);

  function setMarkerRef(id: string, marker: google.maps.Marker | null) {
    if (marker) {
      markersRef.current[id] = marker;
    } else {
      delete markersRef.current[id];
    }
  }

  const selected = useMemo(
    () => resorts.find((r) => r.id === selectedId) ?? null,
    [resorts, selectedId]
  );

  return (
    <>
      {resorts.map((resort) => (
        <Marker
          key={resort.id}
          position={{ lat: resort.latitude, lng: resort.longitude }}
          icon={createPricePinIcon(resort.priceFrom, {
            selected: resort.id === selectedId,
          })}
          title={resort.name}
          zIndex={resort.id === selectedId ? 999 : undefined}
          onClick={() => {
            setSelectedId(resort.id);
            setSelectedAnchor(markersRef.current[resort.id] ?? null);
          }}
          ref={(marker) => setMarkerRef(resort.id, marker)}
        />
      ))}

      {selected && (
        <InfoWindow
          anchor={selectedAnchor}
          onCloseClick={() => {
            setSelectedId(null);
            setSelectedAnchor(null);
          }}
        >
          <MapResortPopup
            resort={selected}
            onNavigate={() => router.push(`/resorts/${selected.slug}`)}
          />
        </InfoWindow>
      )}
    </>
  );
}
