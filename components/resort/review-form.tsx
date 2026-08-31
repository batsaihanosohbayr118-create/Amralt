"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { reviewSchema, type ReviewInput } from "@/lib/validations/review";
import { createReview } from "@/lib/actions/reviews";
import { cn } from "@/lib/utils";

type Props = {
  resortId: string;
  resortSlug: string;
  hasReviewed: boolean;
};

export function ReviewForm({ resortId, resortSlug, hasReviewed }: Props) {
  const t = useTranslations("ReviewForm");
  const { status } = useSession();
  const [isPending, startTransition] = useTransition();
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  if (status === "unauthenticated") {
    return (
      <p className="rounded-2xl bg-secondary/40 p-4 text-sm text-muted-foreground">
        {t("loginPromptBefore")}{" "}
        <Link href="/login" className="font-medium text-primary underline">
          {t("loginPromptLink")}
        </Link>
        .
      </p>
    );
  }

  if (hasReviewed || submitted) {
    return (
      <p className="rounded-2xl bg-secondary/40 p-4 text-sm text-muted-foreground">
        {t("thankYou")}
      </p>
    );
  }

  function onSubmit(values: ReviewInput) {
    startTransition(async () => {
      const result = await createReview(resortId, resortSlug, values);
      if (result.ok) {
        toast.success(t("posted"));
        setSubmitted(true);
      } else {
        toast.error(result.error);
      }
    });
  }

  const rating = form.watch("rating");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <div
                className="flex gap-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onClick={() => field.onChange(star)}
                    aria-label={t("starAriaLabel", { star })}
                  >
                    <Star
                      className={cn(
                        "size-7 transition-colors",
                        star <= (hoverRating || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-transparent text-muted-foreground/40"
                      )}
                    />
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder={t("commentPlaceholder")}
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? t("submitting") : t("submit")}
        </Button>
      </form>
    </Form>
  );
}
