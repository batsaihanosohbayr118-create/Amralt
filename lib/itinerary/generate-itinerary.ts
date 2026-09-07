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
  "horse-riding": ["морь", "адуу", "horse"],
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

  const lines: string[] = [];

  lines.push(
    t("headerTitle", { location: locationName, days: input.days }),
    t("headerMeta", {
      guests: input.guests,
      budget: input.budget ? t(`budget.${input.budget}`) : t("budgetUnknown"),
    })
  );

  // Day 1 — travel + arrival
  const day1: string[] = [t("day1Title")];
  if (distanceKm != null && travelMinutes != null) {
    day1.push(
      t("day1Travel", {
        resort: primaryName,
        km: formatKm(distanceKm, locale),
        duration: formatDuration(travelMinutes, locale),
      })
    );
  }
  day1.push(
    t("day1Arrival", {
      resort: primaryName,
      accommodation: picked?.accommodation.name ?? t("day1DefaultAccommodation"),
    })
  );
  if (activities[0]) {
    day1.push(t("eveningActivity", { activity: t(`activity.${activities[0]}`) }));
  }
  lines.push(day1.join("\n"));

  // Middle days
  for (let d = 2; d < input.days; d++) {
    const acts = [
      activities[(d - 2) % activities.length],
      activities[(d - 1) % activities.length],
    ].filter((v, i, arr) => arr.indexOf(v) === i);

    const dayLines = [t("middleDayTitle", { day: d, location: locationName })];
    for (const act of acts) {
      dayLines.push(`- ${t(`activity.${act}`)}.`);
    }
    const locationDescription = location.description
      ? localizedDescription(locale, location.description, location.descriptionEn, location.descriptionZh)
      : null;
    if (locationDescription) {
      dayLines.push(`- ${locationDescription}`);
    }
    lines.push(dayLines.join("\n"));
  }

  // Last day (only if more than 1 day)
  if (input.days > 1) {
    const lastDay = [
      t("lastDayTitle", { days: input.days }),
      t("lastDayMorning", { resort: primaryName }),
    ];
    if (distanceKm != null && travelMinutes != null) {
      lastDay.push(
        t("lastDayReturn", {
          km: formatKm(distanceKm, locale),
          duration: formatDuration(travelMinutes, locale),
        })
      );
    }
    lines.push(lastDay.join("\n"));
  }

  // Budget summary
  if (picked) {
    const total = picked.accommodation.price * picked.units * input.days;
    lines.push(
      [
        t("budgetSummaryTitle"),
        t("budgetSummaryLine", {
          accommodation: picked.accommodation.name,
          units: picked.units,
          days: input.days,
          total: formatMNT(total, locale),
        }),
        t("budgetSummaryNote"),
      ].join("\n")
    );
  }

  // Alternatives
  const alternatives = ranked.slice(1, 3);
  if (alternatives.length > 0) {
    lines.push(
      [
        t("alternativesTitle"),
        ...alternatives.map((r) =>
          t("alternativeLine", {
            name: localizedName(locale, r.name, r.nameEn, r.nameZh),
            rating: r.rating.toFixed(1),
            price: formatMNT(r.priceFrom, locale),
          })
        ),
      ].join("\n")
    );
  }

  return {
    text: lines.join("\n\n"),
    locationName,
  };
}
