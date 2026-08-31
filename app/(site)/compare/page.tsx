import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Scale } from "lucide-react";

import { getResortsByIds } from "@/lib/data/resorts";
import { CompareTable } from "@/components/resort/compare-table";
import { EmptyState } from "@/components/ui/empty-state";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ComparePage");
  return { title: t("title") };
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const resortIds = ids?.split(",").filter(Boolean) ?? [];
  const resorts = await getResortsByIds(resortIds);
  const t = await getTranslations("ComparePage");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {t("subtitle")}
      </p>

      <div className="mt-8">
        {resorts.length === 0 ? (
          <EmptyState
            icon={Scale}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        ) : (
          <CompareTable resorts={resorts} />
        )}
      </div>
    </div>
  );
}
