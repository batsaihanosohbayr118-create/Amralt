"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteResort, setResortFeatured } from "@/lib/actions/resorts";

export function ResortRowActions({
  resortId,
  featured,
}: {
  resortId: string;
  featured: boolean;
}) {
  const t = useTranslations("ResortRowActions");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(t("confirmDelete"))) return;
    startTransition(async () => {
      const result = await deleteResort(resortId);
      if (result.ok) {
        toast.success(t("deleted"));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleToggleFeatured() {
    startTransition(async () => {
      const result = await setResortFeatured(resortId, !featured);
      if (result.ok) {
        toast.success(featured ? t("removedFromFeatured") : t("addedToFeatured"));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={handleToggleFeatured}
        disabled={isPending}
        aria-label={featured ? t("removeFromFeatured") : t("makeFeatured")}
      >
        <Star
          className={cn(
            "size-3.5",
            featured && "fill-amber-400 text-amber-400"
          )}
        />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        nativeButton={false}
        render={<Link href={`/admin/resorts/${resortId}/edit`} />}
      >
        <Pencil className="size-3.5" />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={handleDelete}
        disabled={isPending}
      >
        <Trash2 className="size-3.5 text-destructive" />
      </Button>
    </div>
  );
}
