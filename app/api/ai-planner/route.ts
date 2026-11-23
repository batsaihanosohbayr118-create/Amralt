import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";

import { generateItinerary } from "@/lib/itinerary/generate-itinerary";
import { tripPlannerSchema } from "@/lib/validations/trip-planner";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/i18n/request";

// Returns the structured itinerary as JSON (rendered by ItineraryView).
export async function POST(request: Request) {
  const store = await cookies();
  const cookieLocale = store.get("locale")?.value;
  const locale: Locale =
    cookieLocale && LOCALES.includes(cookieLocale as Locale)
      ? (cookieLocale as Locale)
      : DEFAULT_LOCALE;

  const body = await request.json().catch(() => null);
  const parsed = tripPlannerSchema.safeParse(body);
  if (!parsed.success) {
    const t = await getTranslations({ locale, namespace: "AiPlannerApi" });
    return NextResponse.json({ error: t("invalidData") }, { status: 400 });
  }

  const result = await generateItinerary(parsed.data, locale);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json(
    { plan: result.plan },
    { headers: { "Cache-Control": "no-store" } }
  );
}
