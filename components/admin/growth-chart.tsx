"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BarChart3 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Locale } from "@/i18n/request";
import { formatDayKey } from "@/lib/date-labels";

type Series = {
  key: string;
  label: string;
  color: string;
  /** Cumulative value at each entry of `days`. */
  values: number[];
};

type Props = {
  title: string;
  ariaLabel: string;
  locale: Locale;
  /** ISO day keys (YYYY-MM-DD), ascending; the last entry is today. */
  days: string[];
  series: Series[];
};

const RANGES = ["7", "30", "90", "all"] as const;
type Range = (typeof RANGES)[number];

const H = 240;
const PAD = { left: 30, right: 44, top: 16, bottom: 30 };
const PLOT_H = H - PAD.top - PAD.bottom;
const DAY_MS = 86_400_000;

const toEpochDay = (key: string) => Math.round(Date.parse(key) / DAY_MS);
const fromEpochDay = (n: number) =>
  new Date(n * DAY_MS).toISOString().slice(0, 10);

function niceTicks(max: number) {
  const raw = Math.max(1, max) / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step =
    [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const top = Math.max(step, Math.ceil(max / step) * step);
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(Math.round(v));
  return { ticks, top };
}

/** Monotone cubic (Fritsch–Carlson) path: smooth, but never overshoots. */
function smoothPath(pts: { x: number; y: number }[]) {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M${pts[0].x},${pts[0].y}`;
  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1].x - pts[i].x);
    m.push(dx[i] === 0 ? 0 : (pts[i + 1].y - pts[i].y) / dx[i]);
  }
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) t.push(0);
    else {
      const w1 = 2 * dx[i] + dx[i - 1];
      const w2 = dx[i] + 2 * dx[i - 1];
      t.push((w1 + w2) / (w1 / m[i - 1] + w2 / m[i]));
    }
  }
  t.push(m[n - 2]);
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += `C${pts[i].x + h},${pts[i].y + t[i] * h} ${pts[i + 1].x - h},${
      pts[i + 1].y - t[i + 1] * h
    } ${pts[i + 1].x},${pts[i + 1].y}`;
  }
  return d;
}

/** Push end-value pills apart so they never overlap. */
function spread(ys: number[], gap: number, min: number, max: number) {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < order.length; k++) {
    if (order[k].y - order[k - 1].y < gap) order[k].y = order[k - 1].y + gap;
  }
  const over = order.length ? order[order.length - 1].y - max : 0;
  if (over > 0) order.forEach((o) => (o.y -= over));
  const under = order.length ? min - order[0].y : 0;
  if (under > 0) order.forEach((o) => (o.y += under));
  const out = new Array<number>(ys.length);
  order.forEach((o) => (out[o.i] = o.y));
  return out;
}

export function GrowthChart({ title, ariaLabel, locale, days, series }: Props) {
  const t = useTranslations("GrowthChart");
  const uid = useId().replace(/:/g, "");
  const [range, setRange] = useState<Range>("all");
  const [active, setActive] = useState<number | null>(null);

  // Draw at the real pixel width so text stays 11px instead of being scaled.
  const boxRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setW(Math.max(260, Math.round(entry.contentRect.width)))
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const PLOT_W = W - PAD.left - PAD.right;

  // Slice the cumulative data to the selected window, adding a start point
  // that carries the running total from before the window.
  const view = useMemo(() => {
    const epochs = days.map(toEpochDay);
    if (range === "all") {
      return { epochs, series: series.map((s) => s.values) };
    }
    const today = epochs[epochs.length - 1];
    const start = today - Number(range);
    const firstInside = epochs.findIndex((e) => e > start);
    const carryIdx = firstInside - 1; // last point at or before start
    const keep = epochs.map((_, i) => i).filter((i) => i >= firstInside);
    return {
      epochs: [start, ...keep.map((i) => epochs[i])],
      series: series.map((s) => [
        carryIdx >= 0 ? s.values[carryIdx] : 0,
        ...keep.map((i) => s.values[i]),
      ]),
    };
  }, [days, series, range]);

  const n = view.epochs.length;
  const first = view.epochs[0];
  const span = Math.max(1, view.epochs[n - 1] - first);
  const xFor = (i: number) =>
    n > 1 ? PAD.left + ((view.epochs[i] - first) / span) * PLOT_W : PAD.left + PLOT_W / 2;

  const max = Math.max(1, ...view.series.flat());
  const { ticks, top } = niceTicks(max);
  const yFor = (v: number) => PAD.top + PLOT_H - (v / top) * PLOT_H;
  const baseY = yFor(0);

  const labels = view.epochs.map((e) => formatDayKey(fromEpochDay(e), locale));

  // X-axis labels: keep those at least 70px apart; the latest date always wins.
  const shownTicks = useMemo(() => {
    const kept: number[] = [];
    for (let i = 0; i < n; i++) {
      const prev = kept[kept.length - 1];
      if (prev === undefined || xFor(i) - xFor(prev) >= 90) kept.push(i);
      else if (i === n - 1 && prev !== 0) kept[kept.length - 1] = i;
    }
    return new Set(kept);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, W]);

  const PILL_H = 18;
  const pillYs = spread(
    view.series.map((v) => yFor(v[n - 1])),
    PILL_H + 3,
    PAD.top + PILL_H / 2,
    baseY
  );

  function nearest(svgX: number) {
    let best = 0;
    for (let i = 1; i < n; i++) {
      if (Math.abs(xFor(i) - svgX) < Math.abs(xFor(best) - svgX)) best = i;
    }
    return best;
  }

  function onPointer(e: React.PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setActive(nearest(((e.clientX - r.left) / r.width) * W));
  }

  function onKey(e: React.KeyboardEvent<SVGSVGElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
      if (e.key === "Escape") setActive(null);
      return;
    }
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    setActive((cur) => Math.min(n - 1, Math.max(0, (cur ?? n - 1) + dir)));
  }

  const act = active !== null && active < n ? active : null;
  const actX = act !== null ? xFor(act) : 0;
  const tipLeft = (actX / W) * 100;
  const flip = tipLeft > 55;

  return (
    <div className="min-w-0 rounded-2xl border border-border/60 p-4 shadow-sm sm:p-5 lg:col-span-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-foreground">
            <BarChart3 className="size-4" />
          </span>
          <h2 className="truncate font-heading text-base font-bold text-foreground">
            {title}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-5">
          <div className="hidden items-center gap-5 xl:flex">
          {series.map((s) => (
            <span
              key={s.key}
              className="flex items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground"
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.label}
            </span>
          ))}
          </div>
          <Select
            value={range}
            onValueChange={(v) => {
              setRange(v as Range);
              setActive(null);
            }}
          >
            <SelectTrigger size="sm" className="rounded-lg text-xs">
              <SelectValue>{(v: Range) => t(`range.${v}`)}</SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              {RANGES.map((r) => (
                <SelectItem key={r} value={r}>
                  {t(`range.${r}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 xl:hidden">
        {series.map((s) => (
            <span
              key={s.key}
              className="flex items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground"
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.label}
            </span>
          ))}
      </div>

      {/* Chart */}
      <div ref={boxRef} className="relative mt-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          className="block max-w-full touch-pan-y overflow-visible rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          role="img"
          aria-label={ariaLabel}
          tabIndex={0}
          onPointerMove={onPointer}
          onPointerDown={onPointer}
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive((c) => c ?? n - 1)}
          onBlur={() => setActive(null)}
          onKeyDown={onKey}
        >
          <defs>
            {series.map((s) => (
              <linearGradient
                key={s.key}
                id={`${uid}-${s.key}`}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          {/* Y axis + faint grid */}
          {ticks.map((v) => (
            <g key={v}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={yFor(v)}
                y2={yFor(v)}
                stroke="var(--color-border)"
                strokeOpacity={v === 0 ? 1 : 0.5}
              />
              <text
                x={PAD.left - 10}
                y={yFor(v) + 4}
                fontSize={11}
                textAnchor="end"
                fill="var(--color-muted-foreground)"
              >
                {v}
              </text>
            </g>
          ))}

          {/* X axis */}
          {labels.map((label, i) =>
            shownTicks.has(i) ? (
              <text
                key={i}
                x={xFor(i)}
                y={H - 8}
                fontSize={11}
                textAnchor={
                  n === 1 ? "middle" : i === 0 ? "start" : i === n - 1 ? "end" : "middle"
                }
                fill="var(--color-muted-foreground)"
              >
                {label}
              </text>
            ) : null
          )}

          {/* Areas (drawn first so every line sits on top) */}
          {series
            .map((s, si) => ({ s, si, peak: Math.max(...view.series[si]) }))
            .sort((a, b) => b.peak - a.peak)
            .map(({ s, si }) => {
            const pts = view.series[si].map((v, i) => ({ x: xFor(i), y: yFor(v) }));
            if (n < 2) return null;
            return (
              <path
                key={s.key}
                d={`${smoothPath(pts)}L${pts[n - 1].x},${baseY}L${pts[0].x},${baseY}Z`}
                fill={`url(#${uid}-${s.key})`}
              />
            );
          })}

          {/* Crosshair */}
          {act !== null && (
            <line
              x1={actX}
              x2={actX}
              y1={PAD.top}
              y2={baseY}
              stroke="var(--color-muted-foreground)"
              strokeOpacity={0.6}
              strokeDasharray="3 4"
            />
          )}

          {/* Lines + markers */}
          {series.map((s, si) => {
            const vals = view.series[si];
            const pts = vals.map((v, i) => ({ x: xFor(i), y: yFor(v) }));
            return (
              <g key={s.key}>
                <path
                  d={smoothPath(pts)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2.25}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {[n - 1, ...(act !== null && act !== n - 1 ? [act] : [])].map((i) => (
                  <circle
                    key={i}
                    cx={pts[i].x}
                    cy={pts[i].y}
                    r={4.5}
                    fill={s.color}
                    stroke="var(--color-card)"
                    strokeWidth={2}
                  />
                ))}
              </g>
            );
          })}

          {/* End-value pills */}
          {series.map((s, si) => {
            const value = String(view.series[si][n - 1]);
            const w = 12 + value.length * 7;
            const x = W - PAD.right + 8;
            const y = pillYs[si];
            return (
              <g key={s.key}>
                <rect
                  x={x}
                  y={y - PILL_H / 2}
                  width={w}
                  height={PILL_H}
                  rx={PILL_H / 2}
                  fill={s.color}
                />
                <text
                  x={x + w / 2}
                  y={y + 4}
                  fontSize={11}
                  fontWeight={700}
                  textAnchor="middle"
                  fill="#fff"
                >
                  {value}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {act !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 w-max min-w-40 rounded-xl border border-border/60 bg-popover px-3.5 py-2.5 text-xs text-popover-foreground shadow-lg"
            style={{
              left: `${tipLeft}%`,
              transform: flip ? "translateX(calc(-100% - 14px))" : "translateX(14px)",
            }}
          >
            <p className="mb-2 font-medium text-foreground">{labels[act]}</p>
            <ul className="space-y-1.5">
              {series.map((s, si) => (
                <li key={s.key} className="flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="whitespace-nowrap text-muted-foreground">{s.label}</span>
                  <span className="ml-auto pl-4 font-bold tabular-nums text-foreground">
                    {view.series[si][act]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
