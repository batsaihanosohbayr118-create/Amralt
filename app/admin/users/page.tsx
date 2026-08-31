import type { Metadata } from "next";
import { Users as UsersIcon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationBar } from "@/components/search/pagination-bar";
import { UserSearch } from "@/components/admin/user-search";
import { UserRoleMenu } from "@/components/admin/user-role-menu";
import type { UserRole } from "@/lib/generated/prisma/enums";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AdminUsersPage");
  return { title: t("metadataTitle") };
}

const PAGE_SIZE = 20;

const ROLE_VARIANT: Record<UserRole, "secondary" | "default" | "outline"> = {
  USER: "outline",
  ADMIN: "default",
};

function formatLastLogin(
  date: Date,
  locale: string,
  t: (key: string, values?: Record<string, Date | number | string>) => string
) {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return t("lastLogin.justNow");
  if (diffMin < 60) return t("lastLogin.minutesAgo", { count: diffMin });
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return t("lastLogin.hoursAgo", { count: diffHour });
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 30) return t("lastLogin.daysAgo", { count: diffDay });

  return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const locale = await getLocale();
  const t = await getTranslations("AdminUsersPage");

  const where = {
    lastLoginAt: { not: null },
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [session, total, users] = await Promise.all([
    auth(),
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { lastLoginAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { favorites: true } },
      },
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const urlSearchParams = new URLSearchParams(q ? { q } : {});

  return (
    <div>
      <UserSearch
        initialQuery={q}
        placeholder={t("searchPlaceholder")}
        ariaLabel={t("searchAriaLabel")}
      />

      <p className="mb-4 text-sm text-muted-foreground">
        {t("totalUsers", { count: total })}
      </p>

      {users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={t("noUsersTitle")}
          description={t("noUsersDescription")}
        />
      ) : (
        <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden scroll-smooth pb-2 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:pb-0 xl:grid-cols-3">
          {users.map((user) => {
            const initials = (user.name ?? user.email ?? "?")
              .slice(0, 1)
              .toUpperCase();
            const isSelf = session?.user?.id === user.id;

            return (
              <div
                key={user.id}
                className="relative flex min-h-56 min-w-[92%] shrink-0 snap-center flex-col gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 first:ml-[4%] last:mr-[4%] hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 sm:min-w-0 sm:shrink sm:first:ml-0 sm:last:mr-0"
              >
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <Avatar className="size-16">
                      <AvatarImage src={user.image ?? undefined} />
                      <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-card bg-emerald-500" />
                  </div>
                  {!isSelf && (
                    <UserRoleMenu userId={user.id} currentRole={user.role} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-foreground">
                      {user.name ?? t("unnamedUser")}
                    </p>
                    <Badge variant={ROLE_VARIANT[user.role]}>
                      {t(`roles.${user.role}`)}
                    </Badge>
                    {isSelf && <Badge variant="ghost">{t("currentUser")}</Badge>}
                  </div>
                  <div className="mt-1 flex min-w-0 flex-col items-start gap-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1">
                    <span className="max-w-full truncate">{user.email}</span>
                    <span className="hidden sm:inline">·</span>
                    <span>{t("favoritesCount", { count: user._count.favorites })}</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="max-w-full break-words">
                      {t("registeredAt", {
                        date: user.createdAt.toLocaleDateString(locale, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }),
                      })}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                    {isSelf && (
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                      </span>
                    )}
                    {isSelf
                      ? t("activeNow")
                      : t("lastLoginAt", {
                          time: formatLastLogin(user.lastLoginAt!, locale, t),
                        })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <PaginationBar
          basePath="/admin/users"
          searchParams={urlSearchParams}
          page={page}
          pageCount={pageCount}
        />
      </div>
    </div>
  );
}
