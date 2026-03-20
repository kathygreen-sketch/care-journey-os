import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Case } from "@/types";
import { STAGE_LABELS, formatRelative } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export function BlockedCases({ cases }: { cases: Case[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          Blocked Cases
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {cases.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">No blocked cases.</p>
        ) : (
          <div className="divide-y">
            {cases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="block px-6 py-3.5 hover:bg-accent/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{c.client_name}</p>
                    <p className="text-xs text-muted-foreground">{STAGE_LABELS[c.current_stage]}</p>
                    {c.blocker_note && (
                      <p className="mt-1 text-xs text-red-600 line-clamp-2">{c.blocker_note}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatRelative(c.updated_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
