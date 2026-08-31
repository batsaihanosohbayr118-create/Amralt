"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleFavorite } from "@/lib/actions/favorites";

type Props = {
  resortId: string;
  initialFavorited: boolean;
  isAuthenticated: boolean;
  variant?: "icon" | "full";
  className?: string;
};

export function FavoriteButton({
  resortId,
  initialFavorited,
  isAuthenticated,
  variant = "icon",
  className,
}: Props) {
  const t = useTranslations("FavoriteButton");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [favorited, setOptimisticFavorited] = useOptimistic(initialFavorited);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    startTransition(async () => {
      setOptimisticFavorited(!favorited);
      const result = await toggleFavorite(resortId);
      if (!result.ok) {
        toast.error(t("mustLoginToSave"));
        router.push("/login");
      }
    });
  }

  if (variant === "full") {
    return (
      <Button
        variant={favorited ? "default" : "outline"}
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "hover:border-emerald-600 hover:bg-emerald-600 hover:text-white",
          className
        )}
      >
        <Heart className={cn(favorited && "fill-current")} />
        {favorited ? t("saved") : t("save")}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={favorited ? t("removeFromSaved") : t("save")}
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-transform hover:scale-105 active:scale-95",
        className
      )}
    >
      <Heart
        className={cn(
          "size-4.5 transition-colors",
          favorited ? "fill-red-500 text-red-500" : "text-foreground"
        )}
      />
    </button>
  );
}
