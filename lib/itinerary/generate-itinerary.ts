import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/db/prisma";
import { formatDuration, formatKm, formatMNT } from "@/lib/format";
import { localizedName, localizedDescription } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/request";
import type { TripPlannerInput } from "@/lib/validations/trip-planner";

const AVG_SPEED_KMH = 55;

const AMENITY_SLUGS = [
  "wifi",
  "restaurant",
  "bbq",
  "sauna",
  "pool",
  "playground",
  "horse-riding",
  "fishing",
  "campfire",
  "parking",
] as const;

const INTEREST_KEYWORDS: Record<string, string[]> = {
  playground: ["хүүхэд", "гэр бүл", "child", "family", "kids"],
  "horse-riding": ["морь", "морин", "адуу", "horse"],
  fishing: ["загас", "fish"],
  sauna: ["саун", "амарч", "тайван", "рашаан", "sauna", "relax", "spa"],
  pool: ["бассейн", "усанд", "pool", "swim"],
  campfire: ["гал", "зугаа", "campfire", "bonfire"],
  restaurant: ["хоол", "food", "restaurant", "dining"],
};

type ResortWithDetails = Awaited<ReturnType<typeof fetchResorts>>[number];

async function fetchResorts(locationId: string) {
  return prisma.resort.findMany({
    where: { status: "APPROVED", locationId },
    orderBy: { rating: "desc" },
    take: 8,
    include: {
      amenities: { include: { amenity: true } },
      accommodations: { orderBy: { price: "asc" } },
      images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1 },
    },
  });
}

function scoreResort(resort: ResortWithDetails, input: TripPlannerInput) {
  let score = resort.rating * 10;

  if (input.budget === "budget") score -= resort.priceFrom / 10000;
  if (input.budget === "luxury") score += resort.priceFrom / 10000;

  const interests = input.interests?.toLowerCase() ?? "";
  if (interests) {
    for (const amenityLink of resort.amenities) {
      const keywords = INTEREST_KEYWORDS[amenityLink.amenity.slug];
      if (keywords?.some((kw) => interests.includes(kw))) {
        score += 25;
      }
    }
  }

  return score;
}

function pickAccommodation(resort: ResortWithDetails, guests: number) {
  const fitting = resort.accommodations.find((a) => a.capacity >= guests);
  if (fitting) return { accommodation: fitting, units: 1 };

  const largest = resort.accommodations[resort.accommodations.length - 1];
  if (!largest) return null;
  return { accommodation: largest, units: Math.ceil(guests / largest.capacity) };
}

function buildActivityList(resort: ResortWithDetails, interests: string) {
  const lower = interests.toLowerCase();
  const slugs = resort.amenities
    .map((a) => a.amenity.slug)
    .filter((slug): slug is (typeof AMENITY_SLUGS)[number] =>
      (AMENITY_SLUGS as readonly string[]).includes(slug)
    );

  const prioritized = slugs.sort((a, b) => {
    const aBoost = INTEREST_KEYWORDS[a]?.some((kw) => lower.includes(kw)) ? -1 : 0;
    const bBoost = INTEREST_KEYWORDS[b]?.some((kw) => lower.includes(kw)) ? -1 : 0;
    return aBoost - bBoost;
  });

  return prioritized.length > 0 ? prioritized : (["parking"] as const);
}

export type TimeSlot = "travel" | "morning" | "afternoon" | "evening";

export type PlanResort = {
  slug: string;
  name: string;
  rating: number;
  reviewCount: number;
  /** null when the resort has no price yet (priceFrom = 0). */
  priceLabel: string | null;
  distanceLabel: string | null;
  image: string | null;
};

export type PlanDay = {
  day: number;
  title: string;
  items: { slot: TimeSlot; text: string }[];
  note?: string;
};

export type ItineraryPlan = {
  title: string;
  locationName: string;
  days: number;
  guests: number;
  budget: TripPlannerInput["budget"] | null;
  primary: PlanResort;
  dayPlans: PlanDay[];
  cost: { line: string; total: string; note: string } | null;
  alternatives: PlanResort[];
  /** Plain-text version used for sharing / copying / printing. */
  text: string;
};

function toPlanResort(resort: ResortWithDetails, locale: Locale): PlanResort {
  return {
    slug: resort.slug,
    name: localizedName(locale, resort.name, resort.nameEn, resort.nameZh),
    rating: Math.round(resort.rating * 10) / 10,
    reviewCount: resort.reviewCount,
    priceLabel: resort.priceFrom > 0 ? formatMNT(resort.priceFrom, locale) : null,
    distanceLabel:
      resort.distanceFromUbKm != null ? formatKm(resort.distanceFromUbKm, locale) : null,
    image: resort.images[0]?.url ?? null,
  };
}

export async function generateItinerary(input: TripPlannerInput, locale: Locale) {
  const t = await getTranslations({ locale, namespace: "Itinerary" });

  const location = await prisma.location.findUnique({
    where: { slug: input.locationSlug },
  });

  if (!location) {
    return { error: t("locationNotFound") as string };
  }

  const resorts = await fetchResorts(location.id);
  const locationName = localizedName(locale, location.name, location.nameEn, location.nameZh);
  if (resorts.length === 0) {
    return {
      error: t("noResorts", { location: locationName }) as string,
    };
  }

  const ranked = [...resorts].sort(
    (a, b) => scoreResort(b, input) - scoreResort(a, input)
  );

  const primary = ranked[0];
  const primaryName = localizedName(locale, primary.name, primary.nameEn, primary.nameZh);
  const picked = pickAccommodation(primary, input.guests);
  const activities = buildActivityList(primary, input.interests ?? "");

  const distanceKm = primary.distanceFromUbKm ?? undefined;
  const travelMinutes = distanceKm != null ? (distanceKm / AVG_SPEED_KMH) * 60 : undefined;

  const title = t("headerTitle", { location: locationName, days: input.days });
  const accommodationName =
    picked?.accommodation.name ?? t("day1DefaultAccommodation");
  const travel =
    distanceKm != null && travelMinutes != null
      ? {
          km: formatKm(distanceKm, locale),
          duration: formatDuration(travelMinutes, locale),
        }
      : null;

  const dayPlans: PlanDay[] = [];

  // Day 1 — travel + arrival
  const day1: PlanDay = { day: 1, title: t("day1Subtitle"), items: [] };
  if (travel) {
    day1.items.push({
      slot: "travel",
      text: t("day1Travel", { resort: primaryName, ...travel }),
    });
  }
  day1.items.push({
    slot: "afternoon",
    text: t("day1Arrival", { resort: primaryName, accommodation: accommodationName }),
  });
  if (activities[0]) {
    day1.items.push({ slot: "evening", text: t(`activity.${activities[0]}`) });
  }
  dayPlans.push(day1);

  // Middle days
  const locationDescription = location.description
    ? localizedDescription(locale, location.description, location.descriptionEn, location.descriptionZh)
    : null;
  for (let d = 2; d < input.days; d++) {
    const acts = [
      activities[(d - 2) % activities.length],
      activities[(d - 1) % activities.length],
    ].filter((v, i, arr) => arr.indexOf(v) === i);
    const slots: TimeSlot[] = ["morning", "afternoon"];
    dayPlans.push({
      day: d,
      title: t("middleDaySubtitle", { location: locationName }),
      items: acts.map((act, i) => ({ slot: slots[i], text: t(`activity.${act}`) })),
      // The region blurb is the same every day — show it once.
      note: d === 2 && locationDescription ? locationDescription : undefined,
    });
  }

  // Last day (only if more than 1 day)
  if (input.days > 1) {
    const last: PlanDay = {
      day: input.days,
      title: t("lastDaySubtitle"),
      items: [{ slot: "morning", text: t("lastDayMorning", { resort: primaryName }) }],
    };
    if (travel) {
      last.items.push({ slot: "travel", text: t("lastDayReturn", travel) });
    }
    dayPlans.push(last);
  }

  const cost = picked
    ? {
        line: t("budgetSummaryLine", {
          accommodation: picked.accommodation.name,
          units: picked.units,
          days: input.days,
          total: formatMNT(picked.accommodation.price * picked.units * input.days, locale),
        }),
        total: formatMNT(picked.accommodation.price * picked.units * input.days, locale),
        note: t("budgetSummaryNote"),
      }
    : null;

  const alternatives = ranked.slice(1, 3).map((r) => toPlanResort(r, locale));

  // Plain-text version (share / copy / PDF).
  const dayTitles: Record<number, string> = {};
  for (const d of dayPlans) {
    dayTitles[d.day] =
      d.day === 1
        ? t("day1Title")
        : d.day === input.days
          ? t("lastDayTitle", { days: input.days })
          : t("middleDayTitle", { day: d.day, location: locationName });
  }
  const blocks: string[] = [
    title,
    t("headerMeta", {
      guests: input.guests,
      budget: input.budget ? t(`budget.${input.budget}`) : t("budgetUnknown"),
    }),
    ...dayPlans.map((d) =>
      [
        dayTitles[d.day],
        ...d.items.map((item) =>
          item.slot === "evening"
            ? t("eveningActivity", { activity: item.text })
            : item.text
        ),
        ...(d.note ? [d.note] : []),
      ].join("\n")
    ),
  ];
  if (cost) {
    blocks.push([t("budgetSummaryTitle"), cost.line, cost.note].join("\n"));
  }
  if (alternatives.length > 0) {
    blocks.push(
      [
        t("alternativesTitle"),
        ...alternatives.map((r) =>
          r.priceLabel
            ? t("alternativeLine", {
                name: r.name,
                rating: r.rating.toFixed(1),
                price: r.priceLabel,
              })
            : t("alternativeLineNoPrice", {
                name: r.name,
                rating: r.rating.toFixed(1),
              })
        ),
      ].join("\n")
    );
  }

  const plan: ItineraryPlan = {
    title,
    locationName,
    days: input.days,
    guests: input.guests,
    budget: input.budget ?? null,
    primary: toPlanResort(primary, locale),
    dayPlans,
    cost,
    alternatives,
    text: blocks.join("\n\n"),
  };

  return { plan };
}
