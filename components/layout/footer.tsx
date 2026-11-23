import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ChevronRight,
  Copyright,
  Heart,
  TreePine,
  UserRound,
} from "lucide-react";


function useColumns() {
  const t = useTranslations("Footer");
  return [
    {
      title: t("travel"),
      icon: TreePine,
      links: [
        { href: "/search", label: t("findResorts") },
        { href: "/map", label: t("map") },
      ],
    },
    {
      title: t("regions"),
      icon: UserRound,
      links: [
        { href: "/search?location=gorkhi-terelj", label: t("regionGorkhiTerelj") },
        { href: "/search?location=khuvsgul", label: t("regionKhuvsgul") },
        { href: "/search?location=arkhangai", label: t("regionArkhangai") },
      ],
    },
  ];
}

export function Footer() {
  const t = useTranslations("Footer");
  const columns = useColumns();

  return (
    <footer className="relative isolate overflow-hidden bg-[#034634] pb-24 text-white md:pb-0">
      {/* Landscape artwork; its bottom edge matches the footer colour. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[max(14rem,33.4vw)]"
      >
        <Image
          src="/footer-landscape.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[60%_top]"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-b from-transparent to-[#034634]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-[max(7rem,19vw)] sm:px-6 xl:pt-[12vw] lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-[minmax(0,1.25fr)_1px_minmax(0,1fr)_minmax(0,1fr)] lg:gap-10 xl:w-[62%]">
          {/* Brand: full width on mobile/tablet, first column from lg */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logo-icon.png"
                alt=""
                width={512}
                height={512}
                className="h-11 w-auto"
              />
              <span className="-ml-1.5 font-heading text-3xl font-bold tracking-tight text-white">
                ayora
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/85">
              {t("tagline")}
            </p>
          </div>

          {/* Divider */}
          <div className="hidden bg-white/15 lg:block" aria-hidden />

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="flex items-center gap-3 font-heading text-base font-bold tracking-wide uppercase">
                <span className="flex size-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <col.icon className="size-4.5" />
                </span>
                {col.title}
              </h3>
              <ul className="mt-6 space-y-4">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex max-w-56 items-center justify-between gap-3 text-[15px] text-white/90 transition-colors hover:text-white"
                    >
                      {link.label}
                      <ChevronRight className="size-4.5 shrink-0 text-white/70 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/15 py-7 text-sm text-white/85 sm:flex-row">
          <p className="flex items-center gap-2">
            <Copyright className="size-4.5" />
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="flex items-center gap-2">
            {t("madeIn")}
            <Heart className="size-4 fill-emerald-400 text-emerald-400" />
          </p>
        </div>
      </div>
    </footer>
  );
}
