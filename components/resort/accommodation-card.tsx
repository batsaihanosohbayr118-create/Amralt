import Image from "next/image";
import { useTranslations } from "next-intl";
import { Check, Users } from "lucide-react";

import { formatMNT } from "@/lib/format";
import type { AccommodationType } from "@/lib/generated/prisma/enums";

type Props = {
  accommodation: {
    id: string;
    type: AccommodationType;
    name: string;
    capacity: number;
    price: number;
    images: string[];
    facilities: string[];
  };
};

export function AccommodationCard({ accommodation }: Props) {
  const t = useTranslations("AccommodationType");
  const tCard = useTranslations("AccommodationCard");
  const cover = accommodation.images[0];

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 sm:flex-row">
      <div className="relative h-44 w-full shrink-0 bg-muted sm:h-auto sm:w-64">
        {cover && (
          <Image
            src={cover}
            alt={accommodation.name}
            fill
            sizes="256px"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <span className="text-xs font-medium text-primary">
            {t(accommodation.type)}
          </span>
          <h4 className="font-heading text-base font-semibold text-foreground">
            {accommodation.name}
          </h4>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="size-4" />
          {tCard("maxGuests", { count: accommodation.capacity })}
        </div>

        {accommodation.facilities.length > 0 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {accommodation.facilities.map((f) => (
              <li
                key={f}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <Check className="size-3.5 text-primary" />
                {f}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-2">
          <div>
            <span className="font-heading text-lg font-bold text-primary">
              {formatMNT(accommodation.price)}
            </span>
            <span className="text-sm text-muted-foreground"> {tCard("perNight")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
