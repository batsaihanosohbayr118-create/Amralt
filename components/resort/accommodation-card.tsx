import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Check, Users } from "lucide-react";

import { formatMNT } from "@/lib/format";
import { localizedName, localizedList } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/request";
import type { AccommodationType } from "@/lib/generated/prisma/enums";

type Props = {
  accommodation: {
    id: string;
    type: AccommodationType;
    name: string;
    nameEn?: string | null;
    nameZh?: string | null;
    capacity: number;
    price: number;
    images: string[];
    facilities: string[];
    facilitiesEn?: string[] | null;
    facilitiesZh?: string[] | null;
  };
};

export function AccommodationCard({ accommodation }: Props) {
  const t = useTranslations("AccommodationType");
  const tCard = useTranslations("AccommodationCard");
  const locale = useLocale() as Locale;
  const cover = accommodation.images[0];
  const name = localizedName(locale, accommodation.name, accommodation.nameEn, accommodation.nameZh);
  const facilities = localizedList(
    locale,
    accommodation.facilities,
    accommodation.facilitiesEn,
    accommodation.facilitiesZh
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 sm:flex-row">
      <div className="relative h-44 w-full shrink-0 bg-muted sm:h-auto sm:w-64">
        {cover && (
          <Image
            src={cover}
            alt={name}
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
            {name}
          </h4>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="size-4" />
          {tCard("maxGuests", { count: accommodation.capacity })}
        </div>

        {facilities.length > 0 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {facilities.map((f) => (
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
              {formatMNT(accommodation.price, locale)}
            </span>
            <span className="text-sm text-muted-foreground"> {tCard("perNight")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
