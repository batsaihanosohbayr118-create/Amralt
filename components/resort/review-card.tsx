import { useLocale, useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/resort/rating-stars";

type Props = {
  review: {
    id: string;
    rating: number;
    title?: string | null;
    comment: string;
    createdAt: Date;
    user: { name: string | null; image: string | null };
  };
};

export function ReviewCard({ review }: Props) {
  const t = useTranslations("ReviewCard");
  const locale = useLocale();
  const initials = (review.user.name ?? "?").slice(0, 1).toUpperCase();

  return (
    <div className="flex gap-3 border-b border-border/60 py-5 last:border-0">
      <Avatar className="size-10 shrink-0">
        <AvatarImage src={review.user.image ?? undefined} />
        <AvatarFallback className="bg-secondary text-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="font-medium text-foreground">
            {review.user.name ?? t("defaultName")}
          </p>
          <time className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }).format(review.createdAt)}
          </time>
        </div>
        <RatingStars rating={review.rating} size="sm" showValue={false} className="mt-1" />
        {review.title && (
          <p className="mt-2 font-medium text-foreground">{review.title}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
      </div>
    </div>
  );
}
