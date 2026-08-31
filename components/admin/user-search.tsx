"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  initialQuery: string;
  placeholder: string;
  ariaLabel: string;
};

function hrefFor(query: string) {
  const params = new URLSearchParams();
  const trimmed = query.trim();
  if (trimmed) params.set("q", trimmed);

  const search = params.toString();
  return search ? `/admin/users?${search}` : "/admin/users";
}

export function UserSearch({ initialQuery, placeholder, ariaLabel }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery === initialQuery.trim()) return;

    const timeoutId = window.setTimeout(() => {
      startTransition(() => {
        router.replace(hrefFor(trimmedQuery), { scroll: false });
      });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [initialQuery, query, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(() => {
      router.replace(hrefFor(query), { scroll: false });
    });
  }

  return (
    <form className="mb-6" onSubmit={handleSubmit}>
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={cn(
            "h-10 w-full rounded-lg border border-border bg-background py-2 pl-10 pr-10 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            isPending && "border-primary/50"
          )}
        />
        {isPending && (
          <Loader2 className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-primary" />
        )}
      </div>
    </form>
  );
}
