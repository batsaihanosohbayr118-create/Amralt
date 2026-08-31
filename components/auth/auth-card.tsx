import Link from "next/link";

import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  size?: "sm" | "lg";
  compact?: boolean;
  children: React.ReactNode;
};

export function AuthCard({
  title,
  description,
  size = "sm",
  compact = false,
  children,
}: Props) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden px-4",
        compact
          ? "min-h-[calc(100vh-4rem)] py-6"
          : "min-h-[calc(100vh-4rem)] py-8 sm:py-12"
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-accent/40 blur-3xl" />
      </div>

      <div className={cn("w-full", size === "lg" ? "max-w-3xl" : "max-w-sm")}>
        <div
          className={cn(
            "rounded-3xl border border-border/60 bg-card shadow-xl shadow-black/5",
            compact ? "p-5 sm:p-7" : "p-6 sm:p-10"
          )}
        >
          <div className={cn("flex items-center gap-2.5", compact ? "mb-4" : "mb-6")}>
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading text-sm font-bold">
                A
              </span>
            </Link>
            <div className="min-w-0">
              <h1
                className={cn(
                  "font-heading font-bold text-foreground",
                  compact ? "text-lg leading-tight" : "text-2xl"
                )}
              >
                {title}
              </h1>
              {description && (
                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  {description}
                </p>
              )}
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
