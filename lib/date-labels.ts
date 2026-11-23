import type { Locale } from "@/i18n/request";

const MONTHS_SHORT = {
  mn: [
    "1-р сар",
    "2-р сар",
    "3-р сар",
    "4-р сар",
    "5-р сар",
    "6-р сар",
    "7-р сар",
    "8-р сар",
    "9-р сар",
    "10-р сар",
    "11-р сар",
    "12-р сар",
  ],
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  zh: [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ],
} as const;

// Deterministic formatter (no Intl/toLocaleDateString) so SSR and client
// output byte-identical text and avoid a hydration mismatch.
export function formatDayKey(key: string, locale: Locale) {
  const [, month, day] = key.split("-").map(Number);
  return `${MONTHS_SHORT[locale][month - 1]} ${day}`;
}
