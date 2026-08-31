import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { localizedName } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/request";

type Props = {
  location: {
    slug: string;
    name: string;
    nameEn?: string | null;
    image: string | null;
    _count: { resorts: number };
  };
};

export function DestinationCard({ location }: Props) {
  const t = useTranslations("DestinationCard");
  const locale = useLocale() as Locale;
  const name = localizedName(locale, location.name, location.nameEn);
  return (
    <Link
      href={`/search?location=${location.slug}`}
      className="group flex w-40 shrink-0 flex-col items-center gap-3 transition-transform duration-300 ease-out hover:-translate-y-2 sm:w-auto"
    >
      <div className="relative size-28 overflow-hidden rounded-full ring-1 ring-border transition-all duration-300 ease-out group-hover:ring-2 group-hover:ring-primary/50 group-hover:shadow-lg group-hover:shadow-primary/20 sm:size-32">
        {location.image && (
          <Image
            src={location.image}
            alt={name}
            fill
            sizes="160px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
      </div>
      <div className="text-center">
        <p className="font-heading text-sm font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
          {name}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("resortCount", { count: location._count.resorts })}
        </p>
      </div>
    </Link>
  );
}
