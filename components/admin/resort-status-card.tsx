import { Layers } from "lucide-react";

type Row = {
  key: string;
  label: string;
  count: number;
  color: string;
};

type Props = {
  title: string;
  rows: Row[];
};

// Pine tree: three stacked tiers plus a short trunk.
function pine(x: number, base: number, h: number) {
  const w = h * 0.42;
  const tier = (top: number, bottom: number, half: number) =>
    `M${x},${top}L${x + half},${bottom}L${x - half},${bottom}Z`;
  return [
    tier(base - h, base - h * 0.55, w * 0.55),
    tier(base - h * 0.75, base - h * 0.28, w * 0.78),
    tier(base - h * 0.5, base - h * 0.06, w),
    `M${x - h * 0.03},${base - h * 0.08}h${h * 0.06}V${base}h${-h * 0.06}Z`,
  ].join("");
}

const BACK_TREES: [number, number, number][] = [
  [196, 112, 30], [210, 114, 24], [262, 110, 34], [278, 113, 26],
  [96, 114, 22], [150, 116, 20],
];
const FRONT_TREES: [number, number, number][] = [
  [10, 132, 44], [30, 134, 54], [52, 134, 38], [72, 136, 30],
  [218, 134, 36], [238, 132, 50], [256, 134, 40], [276, 132, 56], [296, 134, 42],
];

function Landscape() {
  return (
    <svg
      viewBox="0 0 300 140"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-x-0 bottom-0 aspect-[300/140] h-auto max-h-44 w-full sm:left-auto sm:w-[45%] sm:[mask-image:linear-gradient(to_right,transparent,black_35%)] lg:left-0 lg:w-full lg:[mask-image:none]"
      aria-hidden
    >
      <defs>
        <linearGradient id="rsc-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#d9f0e1" stopOpacity={0} />
          <stop offset="100%" stopColor="#d9f0e1" stopOpacity={0.9} />
        </linearGradient>
        <linearGradient id="rsc-mtn" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#e8f5ee" />
          <stop offset="100%" stopColor="#a9d6be" />
        </linearGradient>
        <linearGradient id="rsc-mtn2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#cfe9db" />
          <stop offset="100%" stopColor="#8cc7a6" />
        </linearGradient>
      </defs>

      <rect x="0" y="20" width="300" height="120" fill="url(#rsc-sky)" />

      {/* birds */}
      <g fill="none" stroke="#7fa596" strokeWidth={1.4} strokeLinecap="round">
        <path d="M232,44q5,-4 9,0q4,-4 9,0" />
        <path d="M258,34q6,-5 11,0q5,-5 11,0" />
        <path d="M204,54q3,-3 6,0q3,-3 6,0" />
      </g>

      {/* far mountains */}
      <path
        d="M0,110L38,82L70,96L120,52L160,86L196,64L232,84L268,58L300,76V140H0Z"
        fill="url(#rsc-mtn)"
      />
      {/* snowy ridge highlights */}
      <path
        d="M120,52L132,62L126,63L138,72L120,64L108,70L112,62Z M268,58L278,66L272,67L282,74L266,67L258,71Z"
        fill="#ffffff"
        opacity={0.8}
      />

      {/* near hills */}
      <path
        d="M0,118Q50,96 100,110T200,104T300,108V140H0Z"
        fill="url(#rsc-mtn2)"
        opacity={0.85}
      />

      {/* back trees */}
      <g fill="#5aa881" opacity={0.75}>
        {BACK_TREES.map(([x, b, h]) => (
          <path key={`b${x}`} d={pine(x, b, h)} />
        ))}
      </g>

      {/* ground */}
      <path d="M0,128Q80,118 150,126T300,124V140H0Z" fill="#7fc39b" />

      {/* front trees */}
      <g fill="#2f8a5c">
        {FRONT_TREES.map(([x, b, h]) => (
          <path key={`f${x}`} d={pine(x, b, h)} />
        ))}
      </g>
      <path d="M0,134Q100,128 180,134T300,132V140H0Z" fill="#5fae7f" />
    </svg>
  );
}

export function ResortStatusCard({ title, rows }: Props) {
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="relative flex min-h-[21rem] min-w-0 sm:min-h-44 lg:min-h-[21rem] flex-col overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card to-emerald-50/40 p-4 shadow-sm sm:p-5 dark:to-emerald-950/20">
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-foreground">
          <Layers className="size-4" />
        </span>
        <h2 className="font-heading text-base font-bold text-foreground">
          {title}
        </h2>
      </div>

      <div className="relative z-10 mt-5 space-y-5 sm:w-[55%] sm:pr-4 lg:w-auto lg:pr-0">
        {rows.map((row) => {
          const pct = (row.count / max) * 100;
          return (
            <div key={row.key} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm text-muted-foreground">
                {row.label}
              </span>
              <div
                className="relative h-2.5 flex-1 rounded-full bg-muted"
                title={`${row.label}: ${row.count}`}
              >
                {row.count > 0 && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${pct}%`,
                      minWidth: "0.625rem",
                      background: `linear-gradient(90deg, color-mix(in oklab, ${row.color} 85%, black), color-mix(in oklab, ${row.color} 55%, white))`,
                    }}
                  >
                    <span
                      className="absolute top-1/2 right-0 size-3.5 -translate-y-1/2 translate-x-1/3 rounded-full ring-2 ring-card"
                      style={{
                        backgroundColor: `color-mix(in oklab, ${row.color} 35%, white)`,
                      }}
                    />
                  </div>
                )}
              </div>
              <span className="w-8 shrink-0 text-right text-sm font-bold tabular-nums text-foreground">
                {row.count}
              </span>
            </div>
          );
        })}
      </div>

      <div className="h-32 flex-1 sm:hidden lg:block" />
      <Landscape />
    </div>
  );
}
