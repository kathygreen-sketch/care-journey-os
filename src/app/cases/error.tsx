"use client";

import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function CasesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Failed to load cases</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          There was a problem fetching your cases. Check your database connection and try again.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </AppLayout>
  );
}
