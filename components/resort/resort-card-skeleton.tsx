import { Skeleton } from "@/components/ui/skeleton";

export function ResortCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
      <Skeleton className="h-5 w-3/4 rounded-full" />
      <Skeleton className="h-4 w-1/2 rounded-full" />
      <Skeleton className="h-5 w-1/3 rounded-full" />
    </div>
  );
}

export function ResortGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <ResortCardSkeleton key={i} />
      ))}
    </div>
  );
}
