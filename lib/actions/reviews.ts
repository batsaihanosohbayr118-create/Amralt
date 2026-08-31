"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { reviewSchema, type ReviewInput } from "@/lib/validations/review";

export async function createReview(resortId: string, resortSlug: string, input: ReviewInput) {
  const session = await auth();
  if (!session?.user) {
    return { ok: false as const, error: "Сэтгэгдэл бичихийн тулд нэвтэрнэ үү." };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Буруу өгөгдөл" };
  }

  const existing = await prisma.review.findUnique({
    where: { resortId_userId: { resortId, userId: session.user.id } },
  });
  if (existing) {
    return { ok: false as const, error: "Та энэ газарт өмнө нь сэтгэгдэл үлдээсэн байна." };
  }

  await prisma.review.create({
    data: {
      resortId,
      userId: session.user.id,
      rating: parsed.data.rating,
      title: parsed.data.title,
      comment: parsed.data.comment,
    },
  });

  const agg = await prisma.review.aggregate({
    where: { resortId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.resort.update({
    where: { id: resortId },
    data: {
      rating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      reviewCount: agg._count,
    },
  });

  revalidatePath(`/resorts/${resortSlug}`);
  return { ok: true as const };
}
