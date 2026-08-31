"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import {
  accommodationFormSchema,
  type AccommodationFormInput,
} from "@/lib/validations/resort";
import { recalcResortPriceFrom } from "@/lib/actions/resorts";

async function canManageResorts() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function createAccommodation(
  resortId: string,
  input: AccommodationFormInput
) {
  if (!(await canManageResorts())) {
    return { ok: false as const, error: "Зөвшөөрөлгүй байна." };
  }
  const parsed = accommodationFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Буруу өгөгдөл" };
  }

  const { imageUrls, ...accommodationData } = parsed.data;
  await prisma.accommodation.create({
    data: { resortId, ...accommodationData, images: imageUrls },
  });
  await recalcResortPriceFrom(resortId);

  revalidatePath(`/admin/resorts/${resortId}/edit`);
  return { ok: true as const };
}

export async function deleteAccommodation(resortId: string, accommodationId: string) {
  if (!(await canManageResorts())) {
    return { ok: false as const, error: "Зөвшөөрөлгүй байна." };
  }

  await prisma.accommodation.delete({ where: { id: accommodationId } });
  await recalcResortPriceFrom(resortId);

  revalidatePath(`/admin/resorts/${resortId}/edit`);
  return { ok: true as const };
}
