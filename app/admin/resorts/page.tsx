import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus, TreePine } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/resort/rating-stars";
import { ResortStatusBadge } from "@/components/admin/resort-status-badge";
import { ResortRowActions } from "@/components/admin/resort-row-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMNT } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AdminResortsPage");
  return { title: t("metadataTitle") };
}

export default async function AdminResortsPage() {
  const t = await getTranslations("AdminResortsPage");
  const resorts = await prisma.resort.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("resortCount", { count: resorts.length })}
        </p>
        <Button nativeButton={false} render={<Link href="/admin/resorts/new" />}>
          <Plus /> {t("addResort")}
        </Button>
      </div>

      {resorts.length === 0 ? (
        <EmptyState
          icon={TreePine}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden scroll-smooth pb-2 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:pb-0 xl:grid-cols-3">
          {resorts.map((resort) => (
            <div
              key={resort.id}
              className="group min-w-[92%] shrink-0 snap-center overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 first:ml-[4%] last:mr-[4%] sm:min-w-0 sm:shrink sm:first:ml-0 sm:last:mr-0"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                {resort.images[0] && (
                  <Image
                    src={resort.images[0].url}
                    alt={resort.name}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                  <ResortStatusBadge status={resort.status} />
                  <ResortRowActions resortId={resort.id} featured={resort.featured} />
                </div>
              </div>

              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 flex-1 truncate font-heading text-lg font-semibold text-foreground">
                    {resort.name}
                  </p>
                  <RatingStars rating={resort.rating} size="sm" />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">
                    {formatMNT(resort.priceFrom)}
                  </span>
                  <span>{t("viewCount", { count: resort.viewCount })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
