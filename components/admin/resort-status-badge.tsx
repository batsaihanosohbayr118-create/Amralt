import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { ResortStatus } from "@/lib/generated/prisma/enums";

const VARIANT: Record<ResortStatus, "default" | "secondary" | "destructive"> = {
  APPROVED: "default",
  PENDING: "secondary",
  REJECTED: "destructive",
};

export function ResortStatusBadge({ status }: { status: ResortStatus }) {
  const t = useTranslations("ResortStatus");
  return <Badge variant={VARIANT[status]}>{t(status)}</Badge>;
}
