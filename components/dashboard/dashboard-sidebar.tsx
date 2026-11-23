"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  DASHBOARD_ICONS,
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-nav";

function pine(x: number, base: number, h: number) {
  const w = h * 0.38;
  const tier = (top: number, bottom: number, half: number) =>
    `M${x},${top}L${x + half},${bottom}L${x - half},${bottom}Z`;
  return [
    tier(base - h, base - h * 0.6, w * 0.5),
    tier(base - h * 0.8, base - h * 0.4, w * 0.7),
    tier(base - h * 0.6, base - h * 0.18, w * 0.88),
    tier(base - h * 0.4, base, w),
  ].join("");
}

const BACK: [number, number, number][] = [
  [20, 236, 48], [62, 232, 60], [118, 238, 44], [168, 230, 56], [214, 234, 50],
];
const FRONT: [number, number, number][] = [
  [6, 262, 70], [40, 266, 92], [84, 262, 62], [140, 266, 78], [192, 262, 96], [236, 266, 70],
];

function Forest() {
  return (
    <svg
      viewBox="0 0 240 270"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="sb-mtn" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3f8a68" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#1d5a42" stopOpacity={0.2} />
        </linearGradient>
        <linearGradient id="sb-fog" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#9fd8bb" stopOpacity={0} />
          <stop offset="100%" stopColor="#9fd8bb" stopOpacity={0.14} />
        </linearGradient>
      </defs>

      {/* soft light ray */}
      <path d="M-20,40L240,-10V30L-20,120Z" fill="#ffffff" opacity={0.035} />

      {/* mountain */}
      <path d="M0,200L60,150L96,128L120,118L150,134L200,166L240,184V270H0Z" fill="url(#sb-mtn)" />
      <rect x="0" y="150" width="240" height="120" fill="url(#sb-fog)" />

      {/* back trees */}
      <g fill="#1f5a43" opacity={0.85}>
        {BACK.map(([x, b, h]) => (
          <path key={`b${x}`} d={pine(x, b, h)} />
        ))}
      </g>

      {/* front trees */}
      <g fill="#0e3626">
        {FRONT.map(([x, b, h]) => (
          <path key={`f${x}`} d={pine(x, b, h)} />
        ))}
      </g>
      <rect x="0" y="258" width="240" height="12" fill="#0b2d20" />
    </svg>
  );
}

export function DashboardSidebar({
  items,
  brand,
}: {
  items: DashboardNavItem[];
  brand: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-hidden bg-gradient-to-b from-[#134a36] via-[#0f3d2d] to-[#0a2c20] text-white lg:flex">
      {/* subtle diagonal sheen */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.06)_0%,transparent_40%)]"
        aria-hidden
      />

      <Link
        href="/"
        className="relative flex items-center gap-2 px-6 pt-7 pb-8"
        aria-label={brand}
      >
        <Image
          src="/logo-icon.png"
          alt=""
          width={512}
          height={512}
          priority
          className="h-10 w-auto drop-shadow-[0_4px_12px_rgba(34,197,94,0.35)]"
        />
        <span className="font-heading text-lg font-bold tracking-tight">
          {brand}
        </span>
      </Link>

      <nav className="relative z-10 flex flex-col gap-1.5 px-3">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = DASHBOARD_ICONS[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-900/40 ring-1 ring-white/15"
                  : "text-white/75 hover:bg-white/8 hover:text-white"
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Forest />
    </aside>
  );
}
