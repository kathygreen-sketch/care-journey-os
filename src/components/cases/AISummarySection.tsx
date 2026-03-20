"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AISummary, CaseDetail } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { generateCaseSummary, generateNextStepPlan, generateNotesSummary } from "@/actions/ai";
import { Sparkles, RefreshCw } from "lucide-react";

interface Props {
  caseDetail: CaseDetail;
  summaries: AISummary[];
}

function getLatest(summaries: AISummary[], type: AISummary["summary_type"]) {
  return summaries.filter((s) => s.summary_type === type)[0] ?? null;
}

export function AISummarySection({ caseDetail, summaries }: Props) {
  const [localSummaries, setLocalSummaries] = useState(summaries);
  const [pending, setPending] = useState<string | null>(null);

  const caseSummary = getLatest(localSummaries, "case_summary");
  const nextStepPlan = getLatest(localSummaries, "next_step_plan");
  const notesSummary = getLatest(localSummaries, "notes_summary");

  async function runAI(
    type: "case_summary" | "next_step_plan" | "notes_summary",
    fn: () => Promise<string>
  ) {
    setPending(type);
    try {
      const content = await fn();
      const newEntry: AISummary = {
        id: Date.now().toString(),
        case_id: caseDetail.id,
        summary_type: type,
        content,
        created_at: new Date().toISOString(),
      };
      setLocalSummaries((prev) => [newEntry, ...prev.filter((s) => s.summary_type !== type)]);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Case Summary */}
      <AIBlock
        title="Case Summary"
        summary={caseSummary}
        isPending={pending === "case_summary"}
        onGenerate={() =>
          runAI("case_summary", () => generateCaseSummary(caseDetail.id, caseDetail))
        }
      />

      {/* Next-Step Plan */}
      <AIBlock
        title="Next-Step Plan"
        summary={nextStepPlan}
        isPending={pending === "next_step_plan"}
        onGenerate={() =>
          runAI("next_step_plan", () => generateNextStepPlan(caseDetail.id, caseDetail))
        }
      />

      {/* Notes Summary */}
      <AIBlock
        title="Notes Summary"
        summary={notesSummary}
        isPending={pending === "notes_summary"}
        onGenerate={() =>
          runAI("notes_summary", () => generateNotesSummary(caseDetail.id, caseDetail))
        }
      />
    </div>
  );
}

function AIBlock({
  title,
  summary,
  isPending,
  onGenerate,
}: {
  title: string;
  summary: AISummary | null;
  isPending: boolean;
  onGenerate: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            {title}
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={onGenerate}
            disabled={isPending}
            className="h-7 gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3 w-3 ${isPending ? "animate-spin" : ""}`} />
            {summary ? "Regenerate" : "Generate"}
          </Button>
        </div>
        {summary && (
          <p className="text-xs text-muted-foreground">
            Generated {formatDateTime(summary.created_at)}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-2">
            <div className="h-4 rounded bg-muted animate-pulse" />
            <div className="h-4 rounded bg-muted animate-pulse w-4/5" />
            <div className="h-4 rounded bg-muted animate-pulse w-3/5" />
          </div>
        ) : summary ? (
          <p className="text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed">
            {summary.content}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No {title.toLowerCase()} generated yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
