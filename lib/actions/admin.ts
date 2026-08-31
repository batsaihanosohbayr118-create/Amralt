"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import type { UserRole } from "@/lib/generated/prisma/enums";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function updateUserRole(userId: string, role: UserRole) {
  const session = await requireAdminSession();
  if (!session) return { ok: false as const, error: "Зөвшөөрөлгүй" };
  if (session.user.id === userId) {
    return { ok: false as const, error: "Өөрийн эрхээ өөрчлөх боломжгүй" };
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
  return { ok: true as const };
}
