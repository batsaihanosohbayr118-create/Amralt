"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db/prisma";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { sendPasswordResetEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export async function requestPasswordReset(email: string) {
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    return { ok: false as const, error: "И-мэйл хаяг буруу байна" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Always report success to avoid leaking which emails are registered.
  if (!user) {
    return { ok: true as const, resetUrl: null };
  }

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;

  await sendPasswordResetEmail(email, resetUrl);

  // Also surface the link directly so the flow stays testable without a
  // configured email provider.
  return { ok: true as const, resetUrl };
}

export async function resetPassword(
  email: string,
  token: string,
  password: string
) {
  const parsed = resetPasswordSchema.safeParse({ password });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message };
  }

  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  });

  if (!record || record.expires < new Date()) {
    return { ok: false as const, error: "Холбоосны хугацаа дууссан байна." };
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token } },
  });

  return { ok: true as const };
}
