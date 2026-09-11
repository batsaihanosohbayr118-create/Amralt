import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Compass, MapPinned } from "lucide-react";

function useColumns() {
  const t = useTranslations("Footer");
  return [
    {
      title: t("travel"),
      icon: Compass,
      links: [
        { href: "/search", label: t("findResorts") },
        { href: "/map", label: t("map") },
        { href: "/compare", label: t("compare") },
      ],
    },
    {
      title: t("regions"),
      icon: MapPinned,
      links: [
        { href: "/search?location=gorkhi-terelj", label: t("regionGorkhiTerelj") },
        { href: "/search?location=khuvsgul", label: t("regionKhuvsgul") },
        { href: "/search?location=arkhangai", label: t("regionArkhangai") },
      ],
    },
  ];
}

export function Footer() {
  return (
    <footer className="pb-24 text-primary-foreground md:pb-0">
      <svg
        aria-hidden
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="block h-24 w-full text-primary sm:h-40"
      >
        <defs>
          <radialGradient id="footerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect
          width="1440"
          height="220"
          style={{ fill: "color-mix(in oklch, currentColor 42%, white 58%)" }}
        />
        <circle cx="1180" cy="55" r="95" fill="url(#footerGlow)" />
        <path
          d="M0,220 L0,140 C140,70 260,150 400,95 C540,40 660,140 800,75 C940,15 1060,120 1200,65 C1300,25 1380,90 1440,55 L1440,220 Z"
          style={{ fill: "color-mix(in oklch, currentColor 42%, white 58%)" }}
        />
        <path
          d="M0,220 L0,165 L170,100 L330,175 L500,80 L660,165 L820,65 L980,155 L1140,90 L1300,165 L1440,110 L1440,220 Z"
          style={{ fill: "color-mix(in oklch, currentColor 68%, white 32%)" }}
        />
        <path
          d="M0,220 L0,190 L130,135 L260,200 L390,120 L520,195 L650,125 L780,200 L910,130 L1040,195 L1170,120 L1300,200 L1440,175 L1440,220 Z"
          fill="currentColor"
        />
      </svg>

      <div className="bg-primary">
        <FooterBody />
      </div>
    </footer>
  );
}

function FooterBody() {
  const t = useTranslations("Footer");
  const columns = useColumns();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-14 pt-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
        <div className="col-span-2">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-icon.png"
              alt=""
              width={512}
              height={512}
              className="h-9 w-auto"
            />
            <span className="font-heading text-xl font-bold tracking-tight text-white -ml-1.5">
              ayora
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-primary-foreground/70">
            {t("tagline")}
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="flex items-center gap-1.5 font-heading text-xs font-semibold uppercase tracking-wider text-white/90">
              <col.icon className="size-3.5" />
              {col.title}
            </h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 text-sm text-primary-foreground/60 sm:flex-row">
        <p>{t("copyright", { year: new Date().getFullYear() })}</p>
        <p>{t("madeIn")}</p>
      </div>
    </div>
  );
}
