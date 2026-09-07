import type { MetadataRoute } from "next";
import { cookies } from "next/headers";

import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/i18n/request";

const NAMES: Record<Locale, { name: string; short_name: string }> = {
  mn: { name: "Amralt.mn — Монголын амралтын газрууд", short_name: "Amralt.mn" },
  en: { name: "Amralt.mn — Mongolia's resorts", short_name: "Amralt.mn" },
  zh: { name: "Amralt.mn — 蒙古国度假村", short_name: "Amralt.mn" },
};

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const store = await cookies();
  const cookieLocale = store.get("locale")?.value;
  const locale =
    cookieLocale && LOCALES.includes(cookieLocale as Locale)
      ? (cookieLocale as Locale)
      : DEFAULT_LOCALE;

  return {
    ...NAMES[locale],
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#007145",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
