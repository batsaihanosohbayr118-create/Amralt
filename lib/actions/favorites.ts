"use server";

import { revalidatePath } from "next/cache";

import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function toggleFavorite(resortId: string) {
  const session = await auth();
  if (!session?.user) {
    return { ok: false as const, error: "UNAUTHENTICATED" as const };
  }

  const userId = session.user.id;

  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!userExists) {
    await signOut({ redirect: false });
    return { ok: false as const, error: "UNAUTHENTICATED" as const };
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_resortId: { userId, resortId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/favorites");
    return { ok: true as const, favorited: false };
  }

  try {
    await prisma.favorite.create({ data: { userId, resortId } });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      return { ok: false as const, error: "UNAUTHENTICATED" as const };
    }
    throw err;
  }

  revalidatePath("/favorites");
  return { ok: true as const, favorited: true };
}

export async function getFavoriteResortIds(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { resortId: true },
  });
  return new Set(favorites.map((f) => f.resortId));
}
