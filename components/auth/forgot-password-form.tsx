"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";
import { requestPasswordReset } from "@/lib/actions/password-reset";

export function ForgotPasswordForm() {
  const t = useTranslations("ForgotPasswordForm");
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: ForgotPasswordInput) {
    startTransition(async () => {
      const result = await requestPasswordReset(values.email);
      setSent(true);
      if (result.ok && result.resetUrl) {
        setDevResetUrl(result.resetUrl);
      }
    });
  }

  if (sent) {
    return (
      <div className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          {t("sentMessage")}
        </p>
        {devResetUrl && (
          <div className="rounded-xl bg-secondary/40 p-3">
            <p className="text-xs text-muted-foreground">
              {t("devHint")}
            </p>
            <a
              href={devResetUrl}
              className="mt-1 block break-all text-xs font-medium text-primary underline"
            >
              {devResetUrl}
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input
                  className="h-11 rounded-xl px-3.5"
                  type="email"
                  placeholder="name@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isPending}>
          {isPending ? t("sending") : t("submit")}
        </Button>
      </form>
    </Form>
  );
}
