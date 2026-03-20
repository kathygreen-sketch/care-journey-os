import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-12" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-b last:border-0">
      <div className="flex items-center gap-3">
        <Skeleton className="h-2 w-2 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 rounded-md" />
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent className="p-0">
                {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3"><Skeleton className="h-5 w-32" /></CardHeader>
              <CardContent className="p-0">
                {Array.from({ length: 2 }).map((_, i) => <RowSkeleton key={i} />)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><Skeleton className="h-5 w-28" /></CardHeader>
              <CardContent className="p-0">
                {Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
