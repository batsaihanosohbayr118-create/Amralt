import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Star, TreePine, Users } from "lucide-react";

import { GrowthChart } from "@/components/admin/growth-chart";
import { ResortStatusCard } from "@/components/admin/resort-status-card";
import { prisma } from "@/lib/db/prisma";
import type { ResortStatus } from "@/lib/generated/prisma/enums";
import type { Locale } from "@/i18n/request";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AdminLayout");
  return { title: t("brand") };
}

const STATUS_ORDER: ResortStatus[] = ["APPROVED", "PENDING", "REJECTED"];

const STATUS_COLOR: Record<ResortStatus, string> = {
  APPROVED: "#0ca30c",
  PENDING: "#fab219",
  REJECTED: "#d03b3b",
};

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function buildCumulativeSeries(dates: Date[], days: string[]) {
  const countByDay = new Map<string, number>();
  for (const d of dates) {
    const key = dayKey(d);
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }
  let running = 0;
  return days.map((day) => {
    running += countByDay.get(day) ?? 0;
    return running;
  });
}

export default async function AdminOverviewPage() {
  const t = await getTranslations("AdminOverviewPage");
  const tStatus = await getTranslations("ResortStatus");
  const locale = (await getLocale()) as Locale;

  const SERIES = [
    { key: "users", label: t("seriesUsers"), color: "#2a78d6" },
    { key: "resorts", label: t("seriesResorts"), color: "#eb6834" },
    { key: "featured", label: t("seriesFeatured"), color: "#1baf7a" },
  ] as const;

  const [
    activeUsers,
    resortCount,
    featuredCount,
    userDates,
    resortDates,
    featuredDates,
    statusGroups,
  ] = await Promise.all([
    prisma.user.count({ where: { lastLoginAt: { not: null } } }),
    prisma.resort.count(),
    prisma.resort.count({ where: { featured: true } }),
    prisma.user
      .findMany({
        where: { lastLoginAt: { not: null } },
        select: { createdAt: true },
      })
      .then((rows) => rows.map((r) => r.createdAt)),
    prisma.resort.findMany({ select: { createdAt: true } }).then((rows) =>
      rows.map((r) => r.createdAt)
    ),
    prisma.resort
      .findMany({ where: { featured: true }, select: { createdAt: true } })
      .then((rows) => rows.map((r) => r.createdAt)),
    prisma.resort.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countByStatus = new Map(
    statusGroups.map((g) => [g.status, g._count._all])
  );

  const stats = [
    { icon: Users, label: t("seriesUsers"), value: activeUsers },
    { icon: TreePine, label: t("seriesResorts"), value: resortCount },
    { icon: Star, label: t("seriesFeatured"), value: featuredCount },
  ];

  const allDates = [...userDates, ...resortDates, ...featuredDates];
  const today = dayKey(new Date());
  // Always extend to today so the chart ends at the current totals.
  const days = Array.from(new Set([...allDates.map(dayKey), today])).sort();

  const chartSeries = SERIES.map((s) => ({
    ...s,
    values: buildCumulativeSeries(
      s.key === "users"
        ? userDates
        : s.key === "resorts"
          ? resortDates
          : featuredDates,
      days
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden scroll-smooth pb-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group min-w-[85%] shrink-0 snap-center rounded-2xl border border-border/60 p-5 transition-all duration-300 ease-out first:ml-[7.5%] last:mr-[7.5%] hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 sm:min-w-0 sm:shrink sm:first:ml-0 sm:last:mr-0"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 ease-out group-hover:scale-110 group-hover:bg-primary/15">
              <stat.icon className="size-4.5" />
            </span>
            <p className="mt-3 font-heading text-2xl font-bold text-foreground">
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
      <GrowthChart
        title={t("combinedGrowth")}
        ariaLabel={t("chartAriaLabel")}
        locale={locale}
        days={days}
        series={chartSeries}
      />

      <ResortStatusCard
        title={t("resortStatus")}
        rows={STATUS_ORDER.map((status) => ({
          key: status,
          label: tStatus(status),
          count: countByStatus.get(status) ?? 0,
          color: STATUS_COLOR[status],
        }))}
      />
      </div>
    </div>
  );
}
