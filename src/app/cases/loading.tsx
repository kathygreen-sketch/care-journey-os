import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function CasesLoading() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 flex-1 max-w-sm rounded-md" />
          <Skeleton className="h-9 w-52 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-hidden">
          <div className="bg-muted/50 border-b px-4 py-3 flex gap-6">
            {["w-32", "w-20", "w-36", "w-20", "w-16", "w-20", "w-16"].map((w, i) => (
              <Skeleton key={i} className={`h-4 ${w}`} />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3.5 border-b last:border-0 flex items-center gap-6">
              <div className="flex items-center gap-2 w-32">
                <Skeleton className="h-2 w-2 rounded-full shrink-0" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
