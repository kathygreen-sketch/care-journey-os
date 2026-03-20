import { STAGE_ORDER, STAGE_LABELS, formatDate } from "@/lib/utils";
import type { CaseStage, CaseStageHistory } from "@/types";
import { Check } from "lucide-react";

interface Props {
  currentStage: CaseStage;
  history: CaseStageHistory[];
}

export function StageTracker({ currentStage, history }: Props) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="relative">
      {/* Connector line */}
      <div className="absolute left-3.5 top-4 bottom-4 w-px bg-border" />

      <div className="space-y-1">
        {STAGE_ORDER.map((stage, i) => {
          const isPast = i < currentIndex;
          const isCurrent = stage === currentStage;
          const isFuture = i > currentIndex;
          const historyEntry = history.find((h) => h.stage_name === stage);

          return (
            <div key={stage} className="relative flex items-start gap-4 py-2">
              {/* Dot */}
              <div
                className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium
                  ${isPast ? "border-emerald-500 bg-emerald-500 text-white" : ""}
                  ${isCurrent ? "border-primary bg-primary text-primary-foreground" : ""}
                  ${isFuture ? "border-border bg-background text-muted-foreground" : ""}
                `}
              >
                {isPast ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>

              {/* Label */}
              <div className="pt-0.5 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    isFuture ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {STAGE_LABELS[stage]}
                </p>
                {historyEntry && (
                  <p className="text-xs text-muted-foreground">
                    {formatDate(historyEntry.entered_at)}
                    {historyEntry.exited_at && ` → ${formatDate(historyEntry.exited_at)}`}
                  </p>
                )}
                {historyEntry?.notes && (
                  <p className="mt-0.5 text-xs text-muted-foreground italic">{historyEntry.notes}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
