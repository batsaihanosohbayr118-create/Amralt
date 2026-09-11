"use server";

import { auth } from "@/lib/auth/auth";
import { scrapeResortPage } from "@/lib/scrape-resort";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function importResortFromUrl(url: string) {
  const session = await requireAdmin();
  if (!session) return { ok: false as const, error: "Зөвшөөрөлгүй байна." };

  const result = await scrapeResortPage(url);
  return result.ok
    ? { ok: true as const, data: result.data }
    : { ok: false as const, error: result.error };
}
