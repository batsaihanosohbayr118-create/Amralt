import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { LOCALES, type Locale } from "@/i18n/request";

export async function POST(request: NextRequest) {
  const { locale } = await request.json();

  if (!LOCALES.includes(locale as Locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const store = await cookies();
  store.set("locale", locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  return NextResponse.json({ ok: true });
}
