"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateCase } from "@/actions/cases";
import type { Case, CaseStage, CaseStatus, Urgency } from "@/types";
import { STAGE_LABELS, STATUS_LABELS, URGENCY_LABELS } from "@/lib/utils";
import { Pencil } from "lucide-react";

interface Props {
  caseData: Pick<
    Case,
    "id" | "current_stage" | "current_status" | "urgency" | "owner_name" | "next_step" | "blocker_note"
  >;
}

const STAGES: CaseStage[] = [
  "intake", "insurance_verification", "financing", "clinic_coordination",
  "medication_protocol", "active_cycle", "retrieval", "transfer",
  "post_procedure", "completed", "on_hold",
];

const STATUSES: CaseStatus[] = ["active", "blocked", "on_hold", "completed", "cancelled"];
const URGENCIES: Urgency[] = ["low", "medium", "high", "critical"];

export function CaseEditDialog({ caseData }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [stage, setStage] = useState<CaseStage>(caseData.current_stage);
  const [status, setStatus] = useState<CaseStatus>(caseData.current_status);
  const [urgency, setUrgency] = useState<Urgency>(caseData.urgency);
  const [ownerName, setOwnerName] = useState(caseData.owner_name);
  const [nextStep, setNextStep] = useState(caseData.next_step ?? "");
  const [blockerNote, setBlockerNote] = useState(caseData.blocker_note ?? "");

  function handleSave() {
    startTransition(async () => {
      await updateCase(caseData.id, {
        current_stage: stage,
        current_status: status,
        urgency,
        owner_name: ownerName,
        next_step: nextStep || null,
        blocker_note: blockerNote || null,
      });
      setOpen(false);
      router.refresh();
    });
  }

  // If status changes away from blocked, clear blocker note
  function handleStatusChange(val: CaseStatus) {
    setStatus(val);
    if (val !== "blocked") setBlockerNote("");
  }

  const stageChanged = stage !== caseData.current_stage;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="h-3.5 w-3.5" /> Edit Case
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Case</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Stage */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Stage {stageChanged && <span className="text-amber-600 ml-1">— stage history will be updated</span>}
            </label>
            <Select value={stage} onValueChange={(v) => setStage(v as CaseStage)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => (
                  <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status + Urgency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
              <Select value={status} onValueChange={(v) => handleStatusChange(v as CaseStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Urgency</label>
              <Select value={urgency} onValueChange={(v) => setUrgency(v as Urgency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {URGENCIES.map((u) => (
                    <SelectItem key={u} value={u}>{URGENCY_LABELS[u]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Owner */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Case Owner</label>
            <Input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Owner name"
            />
          </div>

          {/* Next Step */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Next Step</label>
            <Textarea
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder="What needs to happen next?"
              rows={2}
            />
          </div>

          {/* Blocker Note — only relevant when blocked */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Blocker Note
              {status !== "blocked" && (
                <span className="ml-1 text-muted-foreground font-normal">(set status to Blocked to use)</span>
              )}
            </label>
            <Textarea
              value={blockerNote}
              onChange={(e) => setBlockerNote(e.target.value)}
              placeholder="What is blocking this case?"
              rows={2}
              disabled={status !== "blocked"}
              className="disabled:opacity-50"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={isPending || !ownerName.trim()} className="flex-1">
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
