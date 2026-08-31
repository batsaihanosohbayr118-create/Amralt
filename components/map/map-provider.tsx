"use client";

import { useEffect } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";

import { GOOGLE_MAPS_API_KEY, hasGoogleMapsKey } from "@/lib/maps/config";
import { suppressGoogleMapsDevWarnings } from "@/lib/maps/suppress-dev-warnings";
import { MapKeyMissing } from "@/components/map/map-key-missing";
import { MapStatusGuard } from "@/components/map/map-status-guard";

export function MapProvider({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    suppressGoogleMapsDevWarnings();
  }, []);

  if (!hasGoogleMapsKey()) {
    return <MapKeyMissing className={className} />;
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <MapStatusGuard className={className}>{children}</MapStatusGuard>
    </APIProvider>
  );
}
