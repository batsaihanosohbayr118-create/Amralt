"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LocateFixed, MapPin, Navigation, Route as RouteIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { UB_CENTER, UB_LABEL, type LatLng } from "@/lib/maps/config";
import { cn } from "@/lib/utils";

type Props = {
  destination: LatLng;
  destinationLabel: string;
  className?: string;
};

export function RoutePanel({ destination, destinationLabel, className }: Props) {
  return <RoutePanelInner destination={destination} destinationLabel={destinationLabel} className={className} />;
}

function RoutePanelInner({
  destination,
  destinationLabel,
  className,
}: {
  destination: LatLng;
  destinationLabel: string;
  className?: string;
}) {
  const t = useTranslations("RoutePanel");
  const [origin, setOrigin] = useState<LatLng>(UB_CENTER);
  const [originLabel, setOriginLabel] = useState(UB_LABEL);
  const [locating, setLocating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;

  function useMyLocation() {
    if (!navigator.geolocation) {
      toast.error(t("geolocationUnsupported"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setOriginLabel(t("myLocation"));
        setLocating(false);
        setExpanded(true);
      },
      () => {
        toast.error(t("geolocationFailed"));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className={cn("rounded-3xl border border-border/60 bg-card p-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MapPin className="size-4 shrink-0 text-primary" />
          <span>{originLabel}</span>
          <span className="text-muted-foreground">→</span>
          <Navigation className="size-4 shrink-0 text-primary" />
          <span>{destinationLabel}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={useMyLocation}
          disabled={locating}
        >
          <LocateFixed />
          {t("myLocation")}
        </Button>
      </div>

      {!expanded ? (
        <Button type="button" className="mt-4" onClick={() => setExpanded(true)}>
          <RouteIcon />
          {t("viewRoute")}
        </Button>
      ) : (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-secondary/40 p-4">
          <p className="text-sm text-muted-foreground">
            {t("openInGoogleMapsHint")}
          </p>
          <Button
            nativeButton={false}
            render={<a href={mapsUrl} target="_blank" rel="noreferrer" />}
            className="shrink-0"
          >
            <RouteIcon />
            {t("openGoogleMaps")}
          </Button>
        </div>
      )}
    </div>
  );
}
