import { Star, TreePine, Users, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Variant = "users" | "resorts" | "featured";

const ICONS: Record<Variant, LucideIcon> = {
  users: Users,
  resorts: TreePine,
  featured: Star,
};

function pine(x: number, base: number, h: number) {
  const w = h * 0.4;
  const tier = (top: number, bottom: number, half: number) =>
    `M${x},${top}L${x + half},${bottom}L${x - half},${bottom}Z`;
  return [
    tier(base - h, base - h * 0.55, w * 0.55),
    tier(base - h * 0.75, base - h * 0.28, w * 0.78),
    tier(base - h * 0.5, base - h * 0.06, w),
    `M${x - h * 0.03},${base - h * 0.08}h${h * 0.06}V${base}h${-h * 0.06}Z`,
  ].join("");
}

function Decoration({ variant, id }: { variant: Variant; id: string }) {
  const hill = (
    <path
      d="M0,120C50,112 70,96 110,92S170,78 200,74V120Z"
      fill={`url(#${id}-hill)`}
    />
  );

  return (
    <svg
      viewBox="0 0 200 120"
      preserveAspectRatio="xMaxYMax meet"
      className="pointer-events-none absolute right-0 bottom-0 h-full w-3/5"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-hill`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#bfe8d0" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#e6f6ec" stopOpacity={0.4} />
        </linearGradient>
        <linearGradient id={`${id}-area`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#22a06b" stopOpacity={0.22} />
          <stop offset="100%" stopColor="#22a06b" stopOpacity={0} />
        </linearGradient>
      </defs>

      {variant === "users" && (
        <>
          {/* faded people silhouettes */}
          <g fill="#d6efe0" opacity={0.9}>
            <circle cx={150} cy={34} r={12} />
            <path d="M128,74c0-14 10-24 22-24s22,10 22,24Z" />
            <circle cx={176} cy={30} r={10} />
            <path d="M160,66c2-12 9-19 16-19s16,7 18,19Z" />
          </g>
          {/* growth line */}
          <path
            d="M40,120C70,116 90,104 112,96S140,90 154,78S176,58 200,66V120Z"
            fill={`url(#${id}-area)`}
          />
          <path
            d="M40,120C70,116 90,104 112,96S140,90 154,78S176,58 200,66"
            fill="none"
            stroke="#1f9d62"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </>
      )}

      {variant === "resorts" && (
        <>
          {hill}
          <g fill="#8fd1ac" opacity={0.75}>
            <path d={pine(124, 92, 34)} />
            <path d={pine(176, 80, 40)} />
          </g>
          <g fill="#5fbb8a" opacity={0.85}>
            <path d={pine(150, 94, 46)} />
            <path d={pine(108, 98, 26)} />
          </g>
        </>
      )}

      {variant === "featured" && (
        <>
          <path
            d="M160,14l9.4,19 21,3-15.2,14.8 3.6,20.9L160,61.8l-18.8,9.9 3.6-20.9L129.6,36l21-3Z"
            fill="#d6efe0"
            stroke="#e9f7ef"
            strokeWidth={3}
            strokeLinejoin="round"
          />
          {hill}
        </>
      )}
    </svg>
  );
}

export function StatCard({
  variant,
  label,
  value,
  className,
}: {
  variant: Variant;
  label: string;
  value: number;
  className?: string;
}) {
  const Icon = ICONS[variant];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 pl-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-600/10",
        className
      )}
    >
      {/* left accent bar */}
      <span
        className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-emerald-500 to-emerald-700"
        aria-hidden
      />

      <Decoration variant={variant} id={`stat-${variant}`} />

      <div className="relative">
        <span className="flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 transition-transform duration-300 ease-out group-hover:scale-110 dark:bg-emerald-900/50 dark:text-emerald-200">
          <Icon className="size-5" />
        </span>
        <p className="mt-3 font-heading text-3xl leading-none font-bold text-foreground tabular-nums">
          {value}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
