import * as cheerio from "cheerio";

export type ImportedResortData = {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  imageUrls?: string[];
  latitude?: number;
  longitude?: number;
};

export type ScrapeResult =
  | { ok: true; data: ImportedResortData }
  | { ok: false; error: string };

const PHONE_PATTERN = /(\+?976[\s-]?)?\d{4}[\s-]?\d{4}/;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
// Page builders (Elementor, Yoast, etc.) often default og:title to the current
// page's slug ("Home", "Welcome") instead of the site name — skip those.
const GENERIC_TITLES = new Set(["home", "welcome", "index", "main", "main page", "нүүр", "нүүр хуудас"]);
const IMAGE_FILENAME_BLOCKLIST =
  /logo|favicon|icon|sprite|placeholder|pixel|spinner|loader|lazy|dummy|revslider|hotspot|portalnav|[-_/]\d{2,4}x\d{2,4}\.(jpe?g|png|gif|webp)/i;
// Lazy-loading themes/plugins put the real image in one of these instead of `src`
// (which usually holds a tiny placeholder while JS is disabled/hasn't run yet).
const LAZY_SRC_ATTRS = ["data-lazy-src", "data-original", "data-lazy", "data-bg", "data-src"];

// SEO plugins often template titles as "%%title%% – %%sitename%%"; when the page
// title equals the site name this renders as "X – X" / "X | X". Collapse that.
function dedupeTitle(title: string) {
  const match = title.match(/^(.+?)\s*[–|-]\s*(.+)$/);
  if (match && match[1].trim().toLowerCase() === match[2].trim().toLowerCase()) {
    return match[1].trim();
  }
  return title;
}

function isValidTelHref(href: string) {
  const digits = href.replace(/^tel:/, "").replace(/\D/g, "");
  return digits.length >= 6;
}

function absoluteUrl(src: string, base: string) {
  try {
    return new URL(src, base).toString();
  } catch {
    return null;
  }
}

// Rough bounding box for Mongolia, used to reject false-positive coordinate matches
// (e.g. random numbers that happen to look like lat/lng pairs).
function isPlausibleMongoliaCoord(lat: number, lng: number) {
  return lat >= 41 && lat <= 52.5 && lng >= 87 && lng <= 120;
}

function extractCoordinates(
  $: cheerio.CheerioAPI,
  html: string,
  jsonLd: Record<string, unknown> | null
): { latitude: number; longitude: number } | null {
  const jsonLdGeo = jsonLd?.geo as Record<string, unknown> | undefined;
  if (jsonLdGeo && typeof jsonLdGeo === "object") {
    const lat = Number(jsonLdGeo.latitude);
    const lng = Number(jsonLdGeo.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng) && isPlausibleMongoliaCoord(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  const geoPosition = $('meta[name="geo.position"]').attr("content");
  if (geoPosition) {
    const [lat, lng] = geoPosition.split(/[;,]\s*/).map(Number);
    if (Number.isFinite(lat) && Number.isFinite(lng) && isPlausibleMongoliaCoord(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  const icbm = $('meta[name="ICBM"]').attr("content");
  if (icbm) {
    const [lat, lng] = icbm.split(/[;,]\s*/).map(Number);
    if (Number.isFinite(lat) && Number.isFinite(lng) && isPlausibleMongoliaCoord(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // Google Maps embed iframes encode coordinates as "!2d<lng>!3d<lat>" in the `pb` param.
  const embedMatch = html.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
  if (embedMatch) {
    const lng = Number(embedMatch[1]);
    const lat = Number(embedMatch[2]);
    if (isPlausibleMongoliaCoord(lat, lng)) return { latitude: lat, longitude: lng };
  }

  // Plain Maps links/embeds: "@<lat>,<lng>", "q=<lat>,<lng>", or "ll=<lat>,<lng>".
  const linkMatch = html.match(/(?:@|[?&](?:q|ll)=)(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/);
  if (linkMatch) {
    const lat = Number(linkMatch[1]);
    const lng = Number(linkMatch[2]);
    if (isPlausibleMongoliaCoord(lat, lng)) return { latitude: lat, longitude: lng };
  }

  return null;
}

function extractJsonLd($: cheerio.CheerioAPI): Record<string, unknown> | null {
  const scripts = $('script[type="application/ld+json"]').toArray();
  for (const el of scripts) {
    try {
      const parsed = JSON.parse($(el).text());
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const c of candidates) {
        const type = String(c?.["@type"] ?? "").toLowerCase();
        if (
          type.includes("hotel") ||
          type.includes("resort") ||
          type.includes("lodging") ||
          type.includes("localbusiness")
        ) {
          return c;
        }
      }
    } catch {
      // ignore malformed JSON-LD blocks
    }
  }
  return null;
}

export async function scrapeResortPage(url: string): Promise<ScrapeResult> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!/^https?:$/.test(parsedUrl.protocol)) throw new Error("invalid protocol");
  } catch {
    return { ok: false, error: "Хүчинтэй URL оруулна уу." };
  }

  let html: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; VayoraImportBot/1.0; +https://vayora.mn)",
      },
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return { ok: false, error: `Вэбсайт ${res.status} код буцаалаа.` };
    }
    html = await res.text();
  } catch {
    return { ok: false, error: "Вэбсайт руу холбогдож чадсангүй." };
  }

  const $ = cheerio.load(html);
  const jsonLd = extractJsonLd($);
  const bodyText = $("body").text();

  const data: ImportedResortData = {};

  const jsonLdName = typeof jsonLd?.name === "string" ? jsonLd.name : undefined;
  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();
  const titleTag = $("title").first().text().trim();
  const nameCandidates = [jsonLdName, ogTitle, titleTag].filter(
    (c): c is string => !!c && !GENERIC_TITLES.has(c.toLowerCase())
  );
  const rawName = nameCandidates[0] || ogTitle || titleTag || undefined;
  data.name = rawName ? dedupeTitle(rawName) : undefined;

  const jsonLdDescription =
    typeof jsonLd?.description === "string" ? jsonLd.description : undefined;
  data.description =
    jsonLdDescription ||
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") ||
    undefined;

  const jsonLdPhone =
    typeof jsonLd?.telephone === "string" ? jsonLd.telephone : undefined;
  const telHref = $('a[href^="tel:"]')
    .toArray()
    .map((el) => $(el).attr("href"))
    .find((href): href is string => !!href && isValidTelHref(href));
  const phoneMatch = bodyText.match(PHONE_PATTERN);
  data.phone =
    jsonLdPhone ||
    (telHref ? telHref.replace(/^tel:/, "").trim() : undefined) ||
    phoneMatch?.[0]?.trim() ||
    undefined;

  const jsonLdEmail = typeof jsonLd?.email === "string" ? jsonLd.email : undefined;
  const mailtoHref = $('a[href^="mailto:"]').first().attr("href");
  const emailMatch = bodyText.match(EMAIL_PATTERN);
  data.email =
    jsonLdEmail ||
    (mailtoHref ? mailtoHref.replace(/^mailto:/, "").trim() : undefined) ||
    emailMatch?.[0]?.trim() ||
    undefined;

  const jsonLdAddress = jsonLd?.address as Record<string, unknown> | undefined;
  if (jsonLdAddress && typeof jsonLdAddress === "object") {
    const parts = [jsonLdAddress.streetAddress, jsonLdAddress.addressLocality]
      .filter((p): p is string => typeof p === "string" && p.length > 0);
    if (parts.length) data.address = parts.join(", ");
  }

  const coords = extractCoordinates($, html, jsonLd);
  if (coords) {
    data.latitude = coords.latitude;
    data.longitude = coords.longitude;
  }

  const imageUrls: string[] = [];
  const jsonLdImage = jsonLd?.image;
  const jsonLdImages = Array.isArray(jsonLdImage)
    ? jsonLdImage
    : typeof jsonLdImage === "string"
      ? [jsonLdImage]
      : [];
  for (const img of jsonLdImages) {
    if (typeof img !== "string") continue;
    const abs = absoluteUrl(img, parsedUrl.toString());
    if (abs) imageUrls.push(abs);
  }
  $('meta[property="og:image"]').each((_, el) => {
    const content = $(el).attr("content");
    if (!content || IMAGE_FILENAME_BLOCKLIST.test(content)) return;
    const abs = absoluteUrl(content, parsedUrl.toString());
    if (abs && !imageUrls.includes(abs)) imageUrls.push(abs);
  });
  if (imageUrls.length < 6) {
    $("img").each((_, el) => {
      if (imageUrls.length >= 6) return;
      const attrs = $(el).attr() ?? {};
      const src = LAZY_SRC_ATTRS.map((a) => attrs[a]).find(Boolean) || attrs.src;
      if (!src || IMAGE_FILENAME_BLOCKLIST.test(src)) return;
      const abs = absoluteUrl(src, parsedUrl.toString());
      if (abs && !imageUrls.includes(abs)) imageUrls.push(abs);
    });
  }
  if (imageUrls.length) data.imageUrls = imageUrls.slice(0, 6);

  const foundAny = Object.values(data).some((v) => (Array.isArray(v) ? v.length > 0 : !!v));
  if (!foundAny) {
    return {
      ok: false,
      error: "Вэбсайтаас ямар ч мэдээлэл олдсонгүй. Гараар бөглөнө үү.",
    };
  }

  return { ok: true, data };
}
