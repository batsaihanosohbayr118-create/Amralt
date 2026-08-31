import { useTranslations } from "next-intl";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
  basePath: string;
  searchParams: URLSearchParams;
  page: number;
  pageCount: number;
};

function hrefFor(basePath: string, searchParams: URLSearchParams, page: number) {
  const params = new URLSearchParams(searchParams);
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

export function PaginationBar({ basePath, searchParams, page, pageCount }: Props) {
  const t = useTranslations("PaginationBar");
  if (pageCount <= 1) return null;

  const pages = new Set<number>([1, pageCount, page - 1, page, page + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text={t("previous")}
            href={hrefFor(basePath, searchParams, Math.max(1, page - 1))}
            aria-disabled={page === 1}
          />
        </PaginationItem>

        {sorted.map((p, i) => (
          <PaginationItem key={p}>
            {i > 0 && p - sorted[i - 1] > 1 && <PaginationEllipsis />}
            <PaginationLink
              href={hrefFor(basePath, searchParams, p)}
              isActive={p === page}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            text={t("next")}
            href={hrefFor(basePath, searchParams, Math.min(pageCount, page + 1))}
            aria-disabled={page === pageCount}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
