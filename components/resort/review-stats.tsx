import { useTranslations } from "next-intl";
import { Star } from "lucide-react";

import { formatRating } from "@/lib/format";

type Props = {
  rating: number;
  reviews: { rating: number }[];
};

export function ReviewStats({ rating, reviews }: Props) {
  const t = useTranslations("ReviewStats");
  const total = reviews.length;
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="flex shrink-0 flex-col items-center gap-1 sm:w-32">
        <p className="font-heading text-4xl font-bold text-foreground">
          {formatRating(rating)}
        </p>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={
                i + 1 <= Math.round(rating)
                  ? "size-4 fill-amber-400 text-amber-400"
                  : "size-4 fill-transparent text-muted-foreground/40"
              }
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{t("reviewCount", { count: total })}</p>
      </div>

      <div className="flex-1 space-y-1.5">
        {counts.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2.5">
            <span className="w-3 text-xs text-muted-foreground">{star}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-amber-400"
                style={{ width: total ? `${(count / total) * 100}%` : "0%" }}
              />
            </div>
            <span className="w-6 text-right text-xs text-muted-foreground">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
