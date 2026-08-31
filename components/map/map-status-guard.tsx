"use client";

import { useTranslations } from "next-intl";
import { APILoadingStatus, useApiLoadingStatus } from "@vis.gl/react-google-maps";

import { MapKeyMissing } from "@/components/map/map-key-missing";

export function MapStatusGuard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const t = useTranslations("MapStatusGuard");
  const status = useApiLoadingStatus();

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <MapKeyMissing
        className={className}
        title={t("loadFailedTitle")}
        description={t("loadFailedDescription")}
      />
    );
  }

  return <>{children}</>;
}
