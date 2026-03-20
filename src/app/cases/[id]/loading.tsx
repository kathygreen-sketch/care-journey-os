import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CaseDetailLoading() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Breadcrumb */}
        <Skeleton className="h-4 w-40" />

        {/* Overview card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-28" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left — stage tracker */}
          <Card>
            <CardHeader className="pb-3"><Skeleton className="h-5 w-28" /></CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
              <Skeleton className="h-9 w-full rounded-md mt-4" />
            </CardContent>
          </Card>

          {/* Right — tasks + notes */}
          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-lg border p-3 flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><Skeleton className="h-5 w-16" /></CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-20 w-full rounded-md" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-md" />
                  <Skeleton className="h-9 w-44 rounded-md" />
                  <Skeleton className="h-9 w-16 rounded-md" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
