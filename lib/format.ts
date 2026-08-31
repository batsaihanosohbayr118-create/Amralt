import type { Locale } from "@/i18n/request";

function numberFormatter(locale: Locale) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "mn-MN");
}

export function formatMNT(amount: number, locale: Locale = "mn") {
  return `${numberFormatter(locale).format(Math.round(amount))}₮`;
}

export function formatKm(km: number, locale: Locale = "mn") {
  const rounded = km < 10 ? Math.round(km * 10) / 10 : Math.round(km);
  const formatted = numberFormatter(locale).format(rounded);
  return locale === "en" ? `${formatted} km` : `${formatted} км`;
}

export function formatDuration(minutes: number, locale: Locale = "mn") {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);

  if (locale === "en") {
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m} min`;
  }

  if (h === 0) return `${m} мин`;
  if (m === 0) return `${h} цаг`;
  return `${h} цаг ${m} мин`;
}

export function formatRating(rating: number) {
  return rating.toFixed(1);
}
