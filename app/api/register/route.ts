import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/i18n/request";

export async function POST(request: Request) {
  const store = await cookies();
  const cookieLocale = store.get("locale")?.value;
  const locale: Locale =
    cookieLocale && LOCALES.includes(cookieLocale as Locale)
      ? (cookieLocale as Locale)
      : DEFAULT_LOCALE;
  const t = await getTranslations({ locale, namespace: "RegisterApi" });

  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: t("invalidData") },
      { status: 400 }
    );
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    nationality,
    address,
    allergies,
    favoriteFoods,
    dietaryRestrictions,
    travelInterests,
    password,
  } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: t("emailTaken") },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: `${lastName} ${firstName}`,
      firstName,
      lastName,
      email,
      phone,
      nationality,
      address,
      allergies,
      favoriteFoods,
      dietaryRestrictions,
      travelInterests,
      password: hashed,
    },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
