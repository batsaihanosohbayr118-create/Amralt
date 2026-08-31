"use client";

import { useTranslations } from "next-intl";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ShareButton({ title }: { title: string }) {
  const t = useTranslations("ShareButton");

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled — no-op
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success(t("linkCopied"));
  }

  return (
    <Button
      variant="outline"
      className="hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
      onClick={handleShare}
    >
      <Share2 /> {t("share")}
    </Button>
  );
}
