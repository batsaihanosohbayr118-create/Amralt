"use client";

import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

import { AIMAG_NAME_BY_ISO } from "@/lib/maps/aimag-names";

const ACTIVE_FILL = "#1f5d3f";
const ACTIVE_FILL_HOVER = "#1f5d3f";
const INACTIVE_FILL = "#94a3b8";

type Props = {
  countByProvince: Record<string, number>;
  onSelectProvince: (province: string) => void;
  onHoverProvince?: (info: { name: string; count: number } | null) => void;
};

export function AimagBoundaries({
  countByProvince,
  onSelectProvince,
  onHoverProvince,
}: Props) {
  const map = useMap();
  const dataRef = useRef<google.maps.Data | null>(null);
  const countsRef = useRef(countByProvince);
  const onSelectRef = useRef(onSelectProvince);
  const onHoverRef = useRef(onHoverProvince);

  countsRef.current = countByProvince;
  onSelectRef.current = onSelectProvince;
  onHoverRef.current = onHoverProvince;

  useEffect(() => {
    if (!map) return;

    const data = new google.maps.Data({ map });
    dataRef.current = data;
    data.loadGeoJson("/data/mongolia-aimags.geojson", {
      idPropertyName: "shapeISO",
    });

    function styleFor(count: number): google.maps.Data.StyleOptions {
      return {
        fillColor: count > 0 ? ACTIVE_FILL : INACTIVE_FILL,
        fillOpacity: count > 0 ? 0.28 : 0.08,
        strokeColor: count > 0 ? ACTIVE_FILL : "#cbd5e1",
        strokeWeight: count > 0 ? 1.5 : 1,
        clickable: count > 0,
        cursor: count > 0 ? "pointer" : "default",
        zIndex: count > 0 ? 2 : 1,
      };
    }

    data.setStyle((feature) => {
      const iso = feature.getProperty("shapeISO") as string;
      const name = AIMAG_NAME_BY_ISO[iso];
      const count = name ? (countsRef.current[name] ?? 0) : 0;
      return styleFor(count);
    });

    const listeners: google.maps.MapsEventListener[] = [];

    listeners.push(
      data.addListener("mouseover", (e: google.maps.Data.MouseEvent) => {
        const iso = e.feature.getProperty("shapeISO") as string;
        const name = AIMAG_NAME_BY_ISO[iso];
        const count = name ? (countsRef.current[name] ?? 0) : 0;
        if (count === 0) return;
        data.overrideStyle(e.feature, {
          fillColor: ACTIVE_FILL_HOVER,
          fillOpacity: 0.55,
          strokeWeight: 2.5,
        });
        if (name) onHoverRef.current?.({ name, count });
      })
    );

    listeners.push(
      data.addListener("mouseout", (e: google.maps.Data.MouseEvent) => {
        data.revertStyle(e.feature);
        onHoverRef.current?.(null);
      })
    );

    listeners.push(
      data.addListener("click", (e: google.maps.Data.MouseEvent) => {
        const iso = e.feature.getProperty("shapeISO") as string;
        const name = AIMAG_NAME_BY_ISO[iso];
        const count = name ? (countsRef.current[name] ?? 0) : 0;
        if (name && count > 0) onSelectRef.current(name);
      })
    );

    return () => {
      listeners.forEach((l) => google.maps.event.removeListener(l));
      data.setMap(null);
      dataRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    dataRef.current?.setStyle((feature) => {
      const iso = feature.getProperty("shapeISO") as string;
      const name = AIMAG_NAME_BY_ISO[iso];
      const count = name ? (countByProvince[name] ?? 0) : 0;
      return {
        fillColor: count > 0 ? ACTIVE_FILL : INACTIVE_FILL,
        fillOpacity: count > 0 ? 0.28 : 0.08,
        strokeColor: count > 0 ? ACTIVE_FILL : "#cbd5e1",
        strokeWeight: count > 0 ? 1.5 : 1,
        clickable: count > 0,
        cursor: count > 0 ? "pointer" : "default",
        zIndex: count > 0 ? 2 : 1,
      };
    });
  }, [countByProvince]);

  return null;
}
