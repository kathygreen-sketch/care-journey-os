import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Clock } from "lucide-react";
import type { OverdueCaseTask } from "@/types";

const priorityVariant: Record<string, "critical" | "high" | "medium" | "low"> = {
  urgent: "critical",
  high: "high",
  medium: "medium",
  low: "low",
};

export function OverdueTasks({ tasks }: { tasks: OverdueCaseTask[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          Overdue Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {tasks.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">No overdue tasks.</p>
        ) : (
          <div className="divide-y">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/cases/${task.case_id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-accent/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.cases?.client_name} · due {task.due_at ? formatDate(task.due_at) : "—"}
                  </p>
                </div>
                <Badge variant={priorityVariant[task.priority] ?? "low"} className="ml-3 shrink-0">
                  {task.priority}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
