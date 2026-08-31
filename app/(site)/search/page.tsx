import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { auth } from "@/lib/auth/auth";
import { localizedName } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/request";
import { getFavoriteResortIds } from "@/lib/actions/favorites";
import {
  getAmenities,
  getDistinctProvinces,
  getPopularLocations,
  getResorts,
} from "@/lib/data/resorts";
import { parseResortFilters, type RawSearchParams } from "@/lib/search-params";
import { SearchBar } from "@/components/search/search-bar";
import { FilterSidebar } from "@/components/search/filter-sidebar";
import { FilterSheet } from "@/components/search/filter-sheet";
import { SortSelect } from "@/components/search/sort-select";
import { SearchResults } from "@/components/search/search-results";
import { PaginationBar } from "@/components/search/pagination-bar";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SearchPageMetadata");
  return { title: t("title"), description: t("description") };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const t = await getTranslations("SearchPage");
  const locale = (await getLocale()) as Locale;
  const rawParams = await searchParams;
  const filters = parseResortFilters(rawParams);

  const [session, provinces, amenities, rawLocations, { items, total, page, pageCount }] =
    await Promise.all([
      auth(),
      getDistinctProvinces(),
      getAmenities(),
      getPopularLocations(),
      getResorts(filters),
    ]);

  const locations = rawLocations.map((l) => ({
    ...l,
    name: localizedName(locale, l.name, l.nameEn),
  }));

  const favoritedIds = session?.user
    ? await getFavoriteResortIds(session.user.id)
    : undefined;

  const urlSearchParams = new URLSearchParams(
    Object.entries(rawParams).flatMap(([k, v]): [string, string][] =>
      v == null ? [] : Array.isArray(v) ? v.map((x) => [k, x]) : [[k, v]]
    )
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SearchBar
        locations={locations}
        compact
        initialLocationSlug={filters.locationSlug}
        initialGuests={filters.guests}
        initialDuration={filters.duration}
        initialBudget={filters.budget}
        initialLandscape={filters.landscape}
      />

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <aside className="hidden w-72 shrink-0 lg:block">
          <FilterSidebar provinces={provinces} amenities={amenities} />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t.rich("resultsCount", {
                count: total,
                b: (chunks) => (
                  <span className="font-semibold text-foreground">
                    {chunks}
                  </span>
                ),
              })}
            </p>
            <div className="flex items-center gap-2">
              <FilterSheet provinces={provinces} amenities={amenities} />
              <SortSelect />
            </div>
          </div>

          <SearchResults
            resorts={items}
            favoritedIds={favoritedIds}
            isAuthenticated={!!session?.user}
          />

          <div className="mt-10">
            <PaginationBar
              basePath="/search"
              searchParams={urlSearchParams}
              page={page}
              pageCount={pageCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
