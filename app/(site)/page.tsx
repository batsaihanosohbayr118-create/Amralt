import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Building2, MapPin, Sparkles, Star } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { getFavoriteResortIds } from "@/lib/actions/favorites";
import {
  getFeaturedResorts,
  getHomeStats,
  getPopularLocations,
} from "@/lib/data/resorts";
import { SearchBar } from "@/components/search/search-bar";
import { ResortGrid } from "@/components/resort/resort-grid";
import { DestinationCard } from "@/components/destination-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default async function HomePage() {
  const t = await getTranslations("Home");
  const [session, locations, featuredResorts, stats] = await Promise.all([
    auth(),
    getPopularLocations(),
    getFeaturedResorts(8),
    getHomeStats(),
  ]);

  const favoritedIds = session?.user
    ? await getFavoriteResortIds(session.user.id)
    : undefined;

  return (
    <div>
      <section className="relative min-h-[620px] overflow-hidden bg-primary sm:min-h-[680px] lg:min-h-[740px]">
        <div className="absolute -inset-1">
          <Image
            src="https://i.pinimg.com/1200x/b6/10/d9/b610d9eae52b5f007dc8797dae6f63f6.jpg"
            alt=""
            fill
            priority
            className="hero-image-motion object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-24 pt-24 text-center sm:px-6 sm:pt-32 lg:px-8">
          <div className="animate-in fade-in slide-in-from-bottom-4 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md duration-700 sm:text-sm">
            <Sparkles className="size-3.5 shrink-0 text-emerald-300" />
            {t("aiBadge")}
          </div>

          <h1 className="animate-in fade-in slide-in-from-bottom-6 font-heading max-w-3xl text-4xl font-bold leading-tight text-white delay-150 duration-700 [text-shadow:0_2px_20px_rgba(0,0,0,0.35)] fill-mode-both sm:text-5xl lg:text-6xl">
            {t("heroBefore")}{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-200 to-white bg-clip-text text-transparent">
              {t("heroHighlight")}
            </span>{" "}
            {t("heroAfter")}
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-6 mt-5 max-w-xl text-balance text-base text-white/90 delay-300 duration-700 fill-mode-both sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="animate-in fade-in slide-in-from-bottom-6 mt-9 w-full max-w-4xl delay-500 duration-700 fill-mode-both">
            <SearchBar locations={locations} />
          </div>

          <div className="animate-in fade-in mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-white/90 delay-700 duration-700 fill-mode-both">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Building2 className="size-4 text-emerald-300" />
              {t("statResorts", { count: stats.resortCount })}
            </div>
            <div className="hidden h-4 w-px bg-white/25 sm:block" />
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="size-4 text-emerald-300" />
              {t("statProvinces", { count: stats.provinceCount })}
            </div>
            <div className="hidden h-4 w-px bg-white/25 sm:block" />
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {t("statRating", { rating: stats.averageRating.toFixed(1) })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              {t("popularRegions")}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("popularRegionsSubtitle")}
            </p>
          </div>
        </div>

        <div className="scrollbar-hide mt-8 flex gap-4 overflow-x-auto overflow-y-hidden pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-4 xl:grid-cols-7">
          {locations.map((location, index) => (
            <ScrollReveal key={location.id} delay={index * 100}>
              <DestinationCard location={location} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                {t("popularResorts")}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t("popularResortsSubtitle")}
              </p>
            </div>
            <Link
              href="/search"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:flex"
            >
              {t("viewAll")} <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-8">
            <ResortGrid
              resorts={featuredResorts}
              favoritedIds={favoritedIds}
              isAuthenticated={!!session?.user}
            />
          </div>

          <div className="mt-8 flex justify-center sm:hidden">
            <Link
              href="/search"
              className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              {t("viewAll")} <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
