import { useTranslations } from "next-intl";

import { AmenityIcon } from "@/components/amenity-icon";

type Props = {
  amenities: { amenity: { slug: string; name: string; icon: string } }[];
};

export function AmenityList({ amenities }: Props) {
  const t = useTranslations("AmenityList");
  const amenityT = useTranslations("AmenityLabels");
  if (amenities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("noAmenities")}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
      {amenities.map(({ amenity }) => (
        <div key={amenity.slug} className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
            <AmenityIcon name={amenity.icon} className="size-4.5" />
          </span>
          <span className="text-sm text-foreground">{amenityT(amenity.slug)}</span>
        </div>
      ))}
    </div>
  );
}
