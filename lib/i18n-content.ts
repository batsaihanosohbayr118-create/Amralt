import type { Locale } from "@/i18n/request";

export function localizedName(
  locale: Locale,
  name: string,
  nameEn?: string | null
) {
  return locale === "en" && nameEn ? nameEn : name;
}
