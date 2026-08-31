import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { ResortGrid } from "@/components/resort/resort-grid";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("FavoritesPage");
  return { title: t("title") };
}

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/favorites");

  const t = await getTranslations("FavoritesPage");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      resort: {
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          location: true,
          category: true,
        },
      },
    },
  });

  const resorts = favorites.map((f) => f.resort);
  const favoritedIds = new Set(resorts.map((r) => r.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {t("subtitle", { count: resorts.length })}
      </p>

      <div className="mt-8">
        <ResortGrid
          resorts={resorts}
          favoritedIds={favoritedIds}
          isAuthenticated
        />
      </div>
    </div>
  );
}
