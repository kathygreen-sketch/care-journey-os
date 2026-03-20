"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateCase } from "@/actions/cases";
import { STAGE_ORDER, STAGE_LABELS } from "@/lib/utils";
import type { CaseStage } from "@/types";
import { ArrowRight } from "lucide-react";

interface Props {
  caseId: string;
  currentStage: CaseStage;
}

export function StageAdvanceButton({ caseId, currentStage }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const nextStage = STAGE_ORDER[currentIndex + 1] as CaseStage | undefined;

  // Don't render if on last stage or on_hold
  if (!nextStage || currentStage === "on_hold") return null;

  function handleAdvance() {
    startTransition(async () => {
      await updateCase(caseId, { current_stage: nextStage });
      router.refresh();
    });
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleAdvance}
      disabled={isPending}
      className="w-full mt-4 gap-1.5"
    >
      <ArrowRight className="h-3.5 w-3.5" />
      {isPending ? "Advancing..." : `Advance to ${STAGE_LABELS[nextStage]}`}
    </Button>
  );
}
