"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MoreVertical, ShieldCheck, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateUserRole } from "@/lib/actions/admin";
import type { UserRole } from "@/lib/generated/prisma/enums";
import { cn } from "@/lib/utils";

export function UserRoleMenu({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: UserRole;
}) {
  const t = useTranslations("UserRoleMenu");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const ROLE_OPTIONS: { role: UserRole; label: string; icon: typeof UserIcon }[] = [
    { role: "USER", label: t("makeUser"), icon: UserIcon },
    { role: "ADMIN", label: t("makeAdmin"), icon: ShieldCheck },
  ];

  function handleChange(role: UserRole) {
    startTransition(async () => {
      const result = await updateUserRole(userId, role);
      if (result.ok) {
        toast.success(t("roleUpdated"));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("changeRole")}
        disabled={isPending}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        )}
      >
        <MoreVertical className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ROLE_OPTIONS.filter((o) => o.role !== currentRole).map((o) => (
          <DropdownMenuItem key={o.role} onClick={() => handleChange(o.role)}>
            <o.icon /> {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
