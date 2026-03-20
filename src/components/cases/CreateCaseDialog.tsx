"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createCase } from "@/actions/cases";
import type { CaseStage, JourneyType, Urgency } from "@/types";
import { Plus } from "lucide-react";

export function CreateCaseDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [clientName, setClientName] = useState("");
  const [journeyType, setJourneyType] = useState<JourneyType>("egg_freezing");
  const [currentStage, setCurrentStage] = useState<CaseStage>("intake");
  const [ownerName, setOwnerName] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("medium");

  function handleCreate() {
    if (!clientName.trim() || !ownerName.trim()) return;
    startTransition(async () => {
      const newCase = await createCase({
        client_name: clientName.trim(),
        journey_type: journeyType,
        current_stage: currentStage,
        owner_name: ownerName.trim(),
        urgency,
      });
      setOpen(false);
      setClientName("");
      setOwnerName("");
      router.push(`/cases/${newCase.id}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> New Case
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Care Case</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Client Name</label>
            <Input
              placeholder="Full name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Journey Type</label>
              <Select value={journeyType} onValueChange={(v) => setJourneyType(v as JourneyType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="egg_freezing">Egg Freezing</SelectItem>
                  <SelectItem value="ivf">IVF</SelectItem>
                  <SelectItem value="iui">IUI</SelectItem>
                  <SelectItem value="surrogacy">Surrogacy</SelectItem>
                  <SelectItem value="donor_egg">Donor Egg</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Urgency</label>
              <Select value={urgency} onValueChange={(v) => setUrgency(v as Urgency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Starting Stage</label>
              <Select value={currentStage} onValueChange={(v) => setCurrentStage(v as CaseStage)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intake">Intake</SelectItem>
                  <SelectItem value="insurance_verification">Insurance Verification</SelectItem>
                  <SelectItem value="financing">Financing</SelectItem>
                  <SelectItem value="clinic_coordination">Clinic Coordination</SelectItem>
                  <SelectItem value="medication_protocol">Medication Protocol</SelectItem>
                  <SelectItem value="active_cycle">Active Cycle</SelectItem>
                  <SelectItem value="retrieval">Retrieval</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="post_procedure">Post Procedure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Case Owner</label>
              <Input
                placeholder="Your name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={handleCreate}
            disabled={!clientName.trim() || !ownerName.trim() || isPending}
            className="w-full mt-2"
          >
            {isPending ? "Creating..." : "Create Case"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
