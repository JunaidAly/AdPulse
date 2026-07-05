import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Row of stat-card skeletons. */
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-7 w-28" />
          <Skeleton className="mt-4 h-4 w-32" />
        </Card>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 320 }: { height?: number }) {
  return (
    <Card className="p-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-4 w-full" style={{ height }} />
    </Card>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <Card className="p-6">
      <Skeleton className="h-5 w-40" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
