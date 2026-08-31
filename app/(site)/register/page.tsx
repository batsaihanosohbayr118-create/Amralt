import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Separator } from "@/components/ui/separator";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RegisterPage");
  return { title: t("title") };
}

export default async function RegisterPage() {
  const t = await getTranslations("RegisterPage");
  const googleEnabled = !!(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
  );

  return (
    <AuthCard
      title={t("title")}
      description={t("description")}
      size="lg"
      compact
    >
      <div className="space-y-4">
        <RegisterForm />

        {googleEnabled && (
          <>
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                {t("or")}
              </span>
            </div>
            <GoogleSignInButton />
          </>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t("login")}
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
