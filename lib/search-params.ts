import type { ResortFilters, SortOption } from "@/lib/data/resorts";

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function list(v: string | string[] | undefined) {
  if (!v) return [];
  return Array.isArray(v) ? v : v.split(",").filter(Boolean);
}

const SORT_VALUES: SortOption[] = [
  "popular",
  "rating",
  "price_asc",
  "price_desc",
  "distance",
];

export function parseResortFilters(params: RawSearchParams): ResortFilters {
  const sortRaw = first(params.sort);
  const sort = SORT_VALUES.includes(sortRaw as SortOption)
    ? (sortRaw as SortOption)
    : undefined;

  return {
    q: first(params.q) || undefined,
    province: first(params.province) || undefined,
    locationSlug: first(params.location) || undefined,
    categorySlug: first(params.category) || undefined,
    landscape: first(params.landscape) || undefined,
    priceMin: first(params.priceMin) ? Number(params.priceMin) : undefined,
    priceMax: first(params.priceMax) ? Number(params.priceMax) : undefined,
    ratingMin: first(params.rating) ? Number(params.rating) : undefined,
    distanceMax: first(params.distance) ? Number(params.distance) : undefined,
    guests: first(params.guests) ? Number(params.guests) : undefined,
    duration: first(params.duration) ? Number(params.duration) : undefined,
    budget: first(params.budget) ? Number(params.budget) : undefined,
    accommodationTypes: list(params.type),
    amenitySlugs: list(params.amenities),
    sort,
    page: first(params.page) ? Number(params.page) : 1,
  };
}
