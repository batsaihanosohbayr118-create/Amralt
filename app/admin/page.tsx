import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Star, TreePine, Users } from "lucide-react";

import { prisma } from "@/lib/db/prisma";
import type { ResortStatus } from "@/lib/generated/prisma/enums";

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

const MONTHS_SHORT = {
  mn: [
    "1-р сар",
    "2-р сар",
    "3-р сар",
    "4-р сар",
    "5-р сар",
    "6-р сар",
    "7-р сар",
    "8-р сар",
    "9-р сар",
    "10-р сар",
    "11-р сар",
    "12-р сар",
  ],
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
} as const;

// Deterministic formatter (no Intl/toLocaleDateString) so SSR and client
// output byte-identical text and avoid a hydration mismatch.
function formatDayKey(key: string, locale: "mn" | "en") {
  const [, month, day] = key.split("-").map(Number);
  return `${MONTHS_SHORT[locale][month - 1]} ${day}`;
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
  const locale = (await getLocale()) as "mn" | "en";

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
  const maxStatusCount = Math.max(
    1,
    ...STATUS_ORDER.map((s) => countByStatus.get(s) ?? 0)
  );

  const stats = [
    { icon: Users, label: t("seriesUsers"), value: activeUsers },
    { icon: TreePine, label: t("seriesResorts"), value: resortCount },
    { icon: Star, label: t("seriesFeatured"), value: featuredCount },
  ];

  const allDates = [...userDates, ...resortDates, ...featuredDates];
  const uniqueDays = Array.from(new Set(allDates.map(dayKey))).sort();
  const days = uniqueDays.length > 0 ? uniqueDays : [dayKey(new Date())];

  const seriesData = {
    users: buildCumulativeSeries(userDates, days),
    resorts: buildCumulativeSeries(resortDates, days),
    featured: buildCumulativeSeries(featuredDates, days),
  };

  const maxValue = Math.max(
    1,
    ...seriesData.users,
    ...seriesData.resorts,
    ...seriesData.featured
  );

  const chartWidth = 640;
  const chartHeight = 220;
  const padLeft = 8;
  const padRight = 28;
  const padTop = 12;
  const padBottom = 28;
  const plotWidth = chartWidth - padLeft - padRight;
  const plotHeight = chartHeight - padTop - padBottom;

  function xFor(i: number) {
    return days.length > 1
      ? padLeft + (i / (days.length - 1)) * plotWidth
      : padLeft + plotWidth / 2;
  }
  function yFor(v: number) {
    return padTop + plotHeight - (v / maxValue) * plotHeight;
  }

  const gridLines = [0, 0.5, 1].map((f) => Math.round(maxValue * f));

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
      <div className="rounded-2xl border border-border/60 p-5 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-sm font-semibold text-foreground">
            {t("combinedGrowth")}
          </h2>
          <div className="flex items-center gap-4">
            {SERIES.map((s) => (
              <span
                key={s.key}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="mt-4 w-full"
          role="img"
          aria-label={t("chartAriaLabel")}
        >
          {gridLines.map((v) => (
            <g key={v}>
              <line
                x1={padLeft}
                x2={chartWidth - padRight}
                y1={yFor(v)}
                y2={yFor(v)}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
              <text
                x={padLeft}
                y={yFor(v) - 4}
                fontSize={10}
                fill="var(--color-muted-foreground)"
              >
                {v}
              </text>
            </g>
          ))}

          {days.map((day, i) => (
            <text
              key={day}
              x={xFor(i)}
              y={chartHeight - 6}
              fontSize={10}
              textAnchor={
                i === 0 ? "start" : i === days.length - 1 ? "end" : "middle"
              }
              fill="var(--color-muted-foreground)"
            >
              {formatDayKey(day, locale)}
            </text>
          ))}

          {SERIES.map((s) => {
            const values = seriesData[s.key];
            const points = values.map((v, i) => `${xFor(i)},${yFor(v)}`);
            return (
              <g key={s.key}>
                <polyline
                  points={points.join(" ")}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {values.map((v, i) => (
                  <circle
                    key={i}
                    cx={xFor(i)}
                    cy={yFor(v)}
                    r={4}
                    fill={s.color}
                    stroke="var(--color-card)"
                    strokeWidth={2}
                  />
                ))}
                <text
                  x={xFor(values.length - 1) + 8}
                  y={yFor(values[values.length - 1]) + 3}
                  fontSize={11}
                  fontWeight={600}
                  fill="var(--color-foreground)"
                >
                  {values[values.length - 1]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="rounded-2xl border border-border/60 p-5">
        <h2 className="font-heading text-sm font-semibold text-foreground">
          {t("resortStatus")}
        </h2>
        <div className="mt-5 space-y-4">
          {STATUS_ORDER.map((status) => {
            const count = countByStatus.get(status) ?? 0;
            const widthPct = (count / maxStatusCount) * 100;
            const label = tStatus(status);

            return (
              <div key={status} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs text-muted-foreground">
                  {label}
                </span>
                <div
                  className="relative h-3 flex-1 bg-muted"
                  title={`${label}: ${count}`}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-r-[4px]"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: STATUS_COLOR[status],
                    }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-sm font-semibold text-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}
