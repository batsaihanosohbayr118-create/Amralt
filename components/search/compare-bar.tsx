"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCompareList } from "@/lib/hooks/use-compare-list";

type CompareItem = {
  id: string;
  name: string;
  slug: string;
  priceFrom: number;
  images: { url: string }[];
};

export function CompareBar() {
  const t = useTranslations("CompareBar");
  const { ids, remove, clear } = useCompareList();
  const [items, setItems] = useState<CompareItem[]>([]);

  useEffect(() => {
    if (ids.length === 0) {
      return;
    }
    fetch(`/api/compare?ids=${ids.join(",")}`)
      .then((res) => res.json())
      .then((data) => setItems(data.resorts ?? []))
      .catch(() => setItems([]));
  }, [ids]);

  if (ids.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 flex justify-center px-4 md:bottom-4">
      <div className="flex w-full max-w-2xl flex-col gap-2 rounded-2xl border border-border/60 bg-card p-3 shadow-xl sm:flex-row sm:items-center sm:gap-3">
        <div className="scrollbar-hide flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {items.map((item) => (
            <div key={item.id} className="relative shrink-0">
              <div className="relative size-12 overflow-hidden rounded-lg bg-muted">
                {item.images[0] && (
                  <Image
                    src={item.images[0].url}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-foreground text-background"
                aria-label={t("remove")}
              >
                <X className="size-2.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={clear}>
            {t("clear")}
          </Button>
          <Button
            size="sm"
            disabled={ids.length < 2}
            nativeButton={false}
            render={<Link href={`/compare?ids=${ids.join(",")}`} />}
          >
            {t("compare", { count: ids.length })}
          </Button>
        </div>
      </div>
    </div>
  );
}
