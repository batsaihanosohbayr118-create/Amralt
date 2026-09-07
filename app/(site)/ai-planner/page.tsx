import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";

import { getPopularLocations } from "@/lib/data/resorts";
import { TripPlannerForm } from "@/components/ai/trip-planner-form";
import { localizedName } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/request";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AiPlannerPage");
  return { title: t("title"), description: t("description") };
}

export default async function AiPlannerPage() {
  const locations = await getPopularLocations();
  const t = await getTranslations("AiPlannerPage");
  const locale = (await getLocale()) as Locale;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-primary">
        <Sparkles className="size-5" />
        <span className="text-xs font-semibold uppercase tracking-wider sm:text-sm">
          {t("title")}
        </span>
      </div>
      <h1 className="mt-2 font-heading text-xl font-bold text-foreground sm:text-3xl">
        {t("heading")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
        {t("description")}
      </p>

      <div className="mt-8">
        <TripPlannerForm
          locations={locations.map((l) => ({
            slug: l.slug,
            name: localizedName(locale, l.name, l.nameEn, l.nameZh),
          }))}
        />
      </div>
    </div>
  );
}
