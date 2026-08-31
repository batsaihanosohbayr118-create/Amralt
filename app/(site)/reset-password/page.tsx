import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ResetPasswordPage");
  return { title: t("title") };
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const { email, token } = await searchParams;
  const t = await getTranslations("ResetPasswordPage");

  if (!email || !token) {
    return (
      <AuthCard title={t("invalidTitle")}>
        <p className="text-sm text-muted-foreground">
          {t("invalidMessage")}
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("title")}>
      <ResetPasswordForm email={email} token={token} />
    </AuthCard>
  );
}
