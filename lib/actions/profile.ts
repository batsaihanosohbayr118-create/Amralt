"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validations/profile";

export async function updateProfile(input: ProfileUpdateInput) {
  const session = await auth();
  if (!session?.user) {
    return { ok: false as const, error: "Нэвтрээгүй байна" };
  }

  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Буруу өгөгдөл",
    };
  }

  const { firstName, lastName, ...rest } = parsed.data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName,
      lastName,
      name: `${lastName} ${firstName}`,
      ...rest,
    },
  });

  revalidatePath("/profile");
  return { ok: true as const };
}
