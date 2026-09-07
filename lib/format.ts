import type { Locale } from "@/i18n/request";

const INTL_LOCALE: Record<Locale, string> = {
  mn: "mn-MN",
  en: "en-US",
  zh: "zh-CN",
};

function numberFormatter(locale: Locale) {
  return new Intl.NumberFormat(INTL_LOCALE[locale]);
}

export function formatMNT(amount: number, locale: Locale = "mn") {
  return `${numberFormatter(locale).format(Math.round(amount))}₮`;
}

export function formatKm(km: number, locale: Locale = "mn") {
  const rounded = km < 10 ? Math.round(km * 10) / 10 : Math.round(km);
  const formatted = numberFormatter(locale).format(rounded);
  if (locale === "en") return `${formatted} km`;
  if (locale === "zh") return `${formatted} 公里`;
  return `${formatted} км`;
}

export function formatDuration(minutes: number, locale: Locale = "mn") {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);

  if (locale === "en") {
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m} min`;
  }

  if (locale === "zh") {
    if (h === 0) return `${m} 分钟`;
    if (m === 0) return `${h} 小时`;
    return `${h} 小时 ${m} 分钟`;
  }

  if (h === 0) return `${m} мин`;
  if (m === 0) return `${h} цаг`;
  return `${h} цаг ${m} мин`;
}

export function formatRating(rating: number) {
  return rating.toFixed(1);
}
