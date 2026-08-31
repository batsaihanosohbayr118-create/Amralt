import { useTranslations } from "next-intl";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRating } from "@/lib/format";

type Props = {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
};

const SIZE_MAP = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

export function RatingStars({
  rating,
  reviewCount,
  size = "md",
  showValue = true,
  className,
}: Props) {
  const t = useTranslations("RatingStars");
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i + 1 <= Math.round(rating);
          return (
            <Star
              key={i}
              className={cn(
                SIZE_MAP[size],
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/40"
              )}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-foreground">
          {formatRating(rating)}
        </span>
      )}
      {reviewCount != null && (
        <span className="text-sm text-muted-foreground">
          ({t("reviewCount", { count: reviewCount })})
        </span>
      )}
    </div>
  );
}
