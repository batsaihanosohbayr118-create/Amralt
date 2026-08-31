import { useTranslations } from "next-intl";
import { MapPinOff } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  title?: string;
  description?: React.ReactNode;
};

export function MapKeyMissing({ className, title, description }: Props) {
  const t = useTranslations("MapKeyMissing");
  const resolvedTitle = title ?? t("title");
  const resolvedDescription = description ?? (
    <>
      {t("descriptionBefore")}{" "}
      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      </code>{" "}
      {t("descriptionAfter")}
    </>
  );

  return (
    <div
      className={cn(
        "flex min-h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-secondary/30 px-6 py-16 text-center",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-background text-muted-foreground">
        <MapPinOff className="size-6" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground">
        {resolvedTitle}
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">{resolvedDescription}</p>
    </div>
  );
}
