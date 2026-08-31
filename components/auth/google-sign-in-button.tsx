"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/auth/google-icon";

export function GoogleSignInButton() {
  const t = useTranslations("GoogleSignInButton");
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full rounded-xl"
      onClick={() => signIn("google", { redirectTo: "/" })}
    >
      <GoogleIcon className="size-4" />
      {t("signInWithGoogle")}
    </Button>
  );
}
