import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  CalendarDays,
  ChevronRight,
  Heart,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileForm } from "@/components/profile/profile-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProfilePage");
  return { title: t("title") };
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/profile");

  const t = await getTranslations("ProfilePage");

  const [favoritesCount, user] = await Promise.all([
    prisma.favorite.count({ where: { userId: session.user.id } }),
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        image: true,
        firstName: true,
        lastName: true,
        phone: true,
        nationality: true,
        address: true,
        allergies: true,
        favoriteFoods: true,
        dietaryRestrictions: true,
        travelInterests: true,
        createdAt: true,
      },
    }),
  ]);

  const initials = (user.name ?? user.email ?? "?").slice(0, 1).toUpperCase();
  const memberSince = user.createdAt.getFullYear();

  const profileFields = [
    user.firstName,
    user.lastName,
    user.phone,
    user.nationality,
    user.address,
    user.allergies,
    user.favoriteFoods,
    user.dietaryRestrictions,
    user.travelInterests,
  ];
  const filled = profileFields.filter((v) => v && v.trim()).length;
  const completion = Math.round((filled / profileFields.length) * 100);

  const quickLinks = [
    { href: "/favorites", icon: Heart, label: t("linkFavorites") },
    { href: "/ai-planner", icon: Sparkles, label: t("linkAiPlanner") },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Cover + identity */}
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
        <div className="relative h-40 sm:h-56">
          <Image
            src="/profile-cover.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="object-cover object-[70%_65%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="relative flex flex-col gap-4 px-5 pb-6 sm:flex-row sm:items-end sm:gap-6 sm:px-8">
          <Avatar className="-mt-12 size-24 shrink-0 shadow-lg ring-4 ring-card sm:-mt-14 sm:size-28">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-500 text-3xl font-bold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 sm:pb-1">
            <h1 className="truncate font-heading text-2xl font-bold text-foreground sm:text-3xl">
              {user.name ?? t("defaultName")}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              {user.email && (
                <span className="flex min-w-0 items-center gap-1.5">
                  <Mail className="size-4 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4 shrink-0" />
                {t("memberSinceBadge", { year: memberSince })}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/favorites"
              className="group rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/40">
                <Heart className="size-4.5" />
              </span>
              <p className="mt-3 font-heading text-2xl font-bold text-foreground tabular-nums">
                {favoritesCount}
              </p>
              <p className="text-xs text-muted-foreground">{t("statSaved")}</p>
            </Link>
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <span className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
                <CalendarDays className="size-4.5" />
              </span>
              <p className="mt-3 font-heading text-2xl font-bold text-foreground tabular-nums">
                {memberSince}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("statMemberSince")}
              </p>
            </div>
          </div>

          {/* Completion */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-sm font-semibold text-foreground">
                {t("completion")}
              </h2>
              <span className="font-heading text-sm font-bold text-primary tabular-nums">
                {completion}%
              </span>
            </div>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t("completion")}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-[width] duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {t("completionHint")}
            </p>
          </div>

          {/* Quick links */}
          <nav className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <h2 className="px-5 pt-4 pb-2 font-heading text-sm font-semibold text-foreground">
              {t("quickLinks")}
            </h2>
            <ul className="pb-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-3 px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/60"
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <link.icon className="size-4" />
                    </span>
                    <span className="flex-1">{link.label}</span>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Personal info form */}
        <section className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserRound className="size-5" />
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">
                {t("personalInfo")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("personalInfoHint")}
              </p>
            </div>
          </div>
          <div className="mt-6 border-t border-border/60 pt-6">
            <ProfileForm
              defaultValues={{
                firstName: user.firstName ?? "",
                lastName: user.lastName ?? "",
                phone: user.phone ?? "",
                nationality: user.nationality ?? "",
                address: user.address ?? "",
                allergies: user.allergies ?? "",
                favoriteFoods: user.favoriteFoods ?? "",
                dietaryRestrictions: user.dietaryRestrictions ?? "",
                travelInterests: user.travelInterests ?? "",
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
