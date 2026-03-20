import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Case, CaseStatus, Urgency } from "@/types";
import { STAGE_LABELS, JOURNEY_TYPE_LABELS, formatRelative } from "@/lib/utils";

function StatusBadge({ status }: { status: CaseStatus }) {
  const variantMap: Record<CaseStatus, "active" | "blocked" | "on_hold" | "completed" | "cancelled"> = {
    active: "active",
    blocked: "blocked",
    on_hold: "on_hold",
    completed: "completed",
    cancelled: "cancelled",
  };
  const labels: Record<CaseStatus, string> = {
    active: "Active",
    blocked: "Blocked",
    on_hold: "On Hold",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return <Badge variant={variantMap[status]}>{labels[status]}</Badge>;
}

function UrgencyDot({ urgency }: { urgency: Urgency }) {
  const colors: Record<Urgency, string> = {
    low: "bg-slate-300",
    medium: "bg-yellow-400",
    high: "bg-orange-500",
    critical: "bg-red-600",
  };
  return <span className={`inline-block h-2 w-2 rounded-full ${colors[urgency]}`} />;
}

export function RecentCases({ cases }: { cases: Case[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Cases</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {cases.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">No cases yet.</p>
        ) : (
          <div className="divide-y">
            {cases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-accent/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <UrgencyDot urgency={c.urgency} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.client_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {JOURNEY_TYPE_LABELS[c.journey_type]} · {STAGE_LABELS[c.current_stage]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <StatusBadge status={c.current_status} />
                  <span className="text-xs text-muted-foreground hidden sm:block">
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
