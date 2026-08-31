import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { AccommodationType } from "@/lib/generated/prisma/enums";

export type SortOption =
  | "popular"
  | "rating"
  | "price_asc"
  | "price_desc"
  | "distance";

export type ResortFilters = {
  q?: string;
  province?: string;
  district?: string;
  locationSlug?: string;
  categorySlug?: string;
  landscape?: string;
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
  distanceMax?: number;
  guests?: number;
  duration?: number;
  budget?: number;
  accommodationTypes?: string[];
  amenitySlugs?: string[];
  sort?: SortOption;
  page?: number;
  pageSize?: number;
};

const MONGOLIAN_PROVINCES = [
  "Архангай аймаг",
  "Баян-Өлгий аймаг",
  "Баянхонгор аймаг",
  "Булган аймаг",
  "Говь-Алтай аймаг",
  "Говьсүмбэр аймаг",
  "Дархан-Уул аймаг",
  "Дорноговь аймаг",
  "Дорнод аймаг",
  "Дундговь аймаг",
  "Завхан аймаг",
  "Орхон аймаг",
  "Өвөрхангай аймаг",
  "Өмнөговь аймаг",
  "Сүхбаатар аймаг",
  "Сэлэнгэ аймаг",
  "Төв аймаг",
  "Увс аймаг",
  "Ховд аймаг",
  "Хөвсгөл аймаг",
  "Хэнтий аймаг",
  "Улаанбаатар",
] as const;

const RESORT_CARD_INCLUDE = {
  images: { orderBy: { order: "asc" as const }, take: 1 },
  location: true,
  category: true,
} satisfies Prisma.ResortInclude;

export type ResortCardData = Prisma.ResortGetPayload<{
  include: typeof RESORT_CARD_INCLUDE;
}>;

export type ResortDetailData = NonNullable<
  Awaited<ReturnType<typeof getResortBySlug>>
>;

function buildWhere(filters: ResortFilters): Prisma.ResortWhereInput {
  const {
    q,
    province,
    district,
    locationSlug,
    categorySlug,
    landscape,
    priceMin,
    priceMax,
    ratingMin,
    distanceMax,
    guests,
    duration,
    budget,
    accommodationTypes,
    amenitySlugs,
  } = filters;

  const AND: Prisma.ResortWhereInput[] = [];

  if (q) {
    AND.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { province: { contains: q, mode: "insensitive" } },
        { district: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (province) AND.push({ province });
  if (district) AND.push({ district });
  if (locationSlug) AND.push({ location: { slug: locationSlug } });
  if (categorySlug) AND.push({ category: { slug: categorySlug } });
  if (landscape) {
    const terms: Record<string, string[]> = {
      steppe: ["тал", "говь"],
      khangai: ["хангай", "архангай", "өвөрхангай"],
      lake: ["нуур", "хөвсгөл"],
      water: ["нуур", "далай", "хөвсгөл"],
    };
    const keywords = terms[landscape] ?? [landscape];
    AND.push({
      OR: keywords.flatMap((keyword) => [
        { name: { contains: keyword, mode: "insensitive" as const } },
        { description: { contains: keyword, mode: "insensitive" as const } },
        { province: { contains: keyword, mode: "insensitive" as const } },
        { district: { contains: keyword, mode: "insensitive" as const } },
        { location: { name: { contains: keyword, mode: "insensitive" as const } } },
      ]),
    });
  }
  if (priceMin != null) AND.push({ priceFrom: { gte: priceMin } });
  const budgetPriceMax =
    budget != null && budget > 0
      ? Math.floor(budget / Math.max(duration ?? 1, 1))
      : undefined;
  const effectivePriceMax =
    priceMax != null && budgetPriceMax != null
      ? Math.min(priceMax, budgetPriceMax)
      : priceMax ?? budgetPriceMax;
  if (effectivePriceMax != null)
    AND.push({ priceFrom: { lte: effectivePriceMax } });
  if (ratingMin != null) AND.push({ rating: { gte: ratingMin } });
  if (distanceMax != null)
    AND.push({ distanceFromUbKm: { lte: distanceMax } });
  if (guests != null)
    AND.push({ accommodations: { some: { capacity: { gte: guests } } } });
  if (accommodationTypes?.length)
    AND.push({
      accommodations: {
        some: { type: { in: accommodationTypes as AccommodationType[] } },
      },
    });
  if (amenitySlugs?.length) {
    for (const slug of amenitySlugs) {
      AND.push({ amenities: { some: { amenity: { slug } } } });
    }
  }

  return {
    status: "APPROVED",
    ...(AND.length ? { AND } : {}),
  };
}

function buildOrderBy(sort?: SortOption): Prisma.ResortOrderByWithRelationInput {
  switch (sort) {
    case "rating":
      return { rating: "desc" };
    case "price_asc":
      return { priceFrom: "asc" };
    case "price_desc":
      return { priceFrom: "desc" };
    case "distance":
      return { distanceFromUbKm: "asc" };
    case "popular":
    default:
      return { reviewCount: "desc" };
  }
}

export async function getResorts(filters: ResortFilters = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const where = buildWhere(filters);
  const orderBy = buildOrderBy(filters.sort);

  const [items, total] = await Promise.all([
    prisma.resort.findMany({
      where,
      orderBy,
      include: RESORT_CARD_INCLUDE,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.resort.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export async function getResortsForMap(filters: ResortFilters = {}) {
  const where = buildWhere(filters);
  return prisma.resort.findMany({
    where,
    include: RESORT_CARD_INCLUDE,
    take: 200,
  });
}

export async function getFeaturedResorts(limit = 6) {
  return prisma.resort.findMany({
    where: { status: "APPROVED", featured: true },
    include: RESORT_CARD_INCLUDE,
    orderBy: { rating: "desc" },
    take: limit,
  });
}

export async function getResortBySlug(slug: string) {
  return prisma.resort.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      amenities: { include: { amenity: true } },
      accommodations: true,
      category: true,
      location: true,
    },
  });
}

export async function getResortsByIds(ids: string[]) {
  if (!ids.length) return [];
  return prisma.resort.findMany({
    where: { id: { in: ids } },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      amenities: { include: { amenity: true } },
      accommodations: true,
      location: true,
      category: true,
    },
  });
}

export async function getPopularLocations() {
  return prisma.location.findMany({
    where: { featured: true },
    include: { _count: { select: { resorts: true } } },
  });
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getAmenities() {
  return prisma.amenity.findMany({ orderBy: { name: "asc" } });
}

export async function getDistinctProvinces() {
  return [...MONGOLIAN_PROVINCES];
}

export async function getHomeStats() {
  const [resortCount, provinces, ratingAgg] = await Promise.all([
    prisma.resort.count(),
    prisma.resort.findMany({ distinct: ["province"], select: { province: true } }),
    prisma.resort.aggregate({ _avg: { rating: true } }),
  ]);

  return {
    resortCount,
    provinceCount: provinces.length,
    averageRating: ratingAgg._avg.rating ?? 0,
  };
}
