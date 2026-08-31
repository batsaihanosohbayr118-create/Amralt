import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Heart, Sparkles, UserRound } from "lucide-react";

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

  const stats = [
    { icon: Heart, value: favoritesCount, label: t("statSaved") },
    { icon: Sparkles, value: memberSince, label: t("statMemberSince") },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-emerald-500 px-6 py-8 shadow-sm sm:px-8 sm:py-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <svg
          aria-hidden
          viewBox="0 0 400 120"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full text-white/10"
        >
          <path
            fill="currentColor"
            d="M0,120 L0,70 L60,20 L110,90 L170,10 L230,80 L290,30 L350,85 L400,50 L400,120 Z"
          />
        </svg>

        <div className="relative flex items-center gap-5">
          <Avatar className="size-20 shrink-0 ring-4 ring-white/40 sm:size-24">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="bg-white/15 text-2xl text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-xl font-bold text-white sm:text-2xl">
              {user.name ?? t("defaultName")}
            </h1>
            <p className="text-sm text-white/80">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/60 bg-card p-4 text-center shadow-sm transition-shadow hover:shadow-md"
          >
            <stat.icon className="mx-auto size-5 text-primary" />
            <p className="mt-2 truncate font-heading text-lg font-bold text-foreground sm:text-xl">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserRound className="size-4.5" />
          </span>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {t("personalInfo")}
          </h2>
        </div>
        <div className="mt-4 rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
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
  );
}
