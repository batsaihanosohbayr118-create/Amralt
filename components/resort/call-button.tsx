import { useTranslations } from "next-intl";
import { Phone } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CallButton({ phone }: { phone?: string | null }) {
  const t = useTranslations("CallButton");
  if (!phone) return null;

  return (
    <Button
      variant="outline"
      className="hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
      nativeButton={false}
      render={<a href={`tel:${phone}`} />}
    >
      <Phone /> {t("call")}
    </Button>
  );
}
