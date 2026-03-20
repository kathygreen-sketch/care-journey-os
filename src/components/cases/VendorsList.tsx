"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { CaseVendor, Vendor, VendorType, VendorStatus } from "@/types";
import { VENDOR_TYPE_LABELS, cn } from "@/lib/utils";
import { addVendorToCase, createVendor, updateCaseVendorStatus, removeVendorFromCase } from "@/actions/vendors";
import {
  Building2, Landmark, Pill, FlaskConical, Shield, Plus, X, ChevronDown,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

const typeIcon: Record<VendorType, React.ReactNode> = {
  clinic:    <Building2 className="h-4 w-4" />,
  lender:    <Landmark className="h-4 w-4" />,
  pharmacy:  <Pill className="h-4 w-4" />,
  lab:       <FlaskConical className="h-4 w-4" />,
  insurance: <Shield className="h-4 w-4" />,
  other:     <Building2 className="h-4 w-4" />,
};

const typeColor: Record<VendorType, string> = {
  clinic:    "bg-blue-50 text-blue-600 border-blue-200",
  lender:    "bg-emerald-50 text-emerald-600 border-emerald-200",
  pharmacy:  "bg-purple-50 text-purple-600 border-purple-200",
  lab:       "bg-teal-50 text-teal-600 border-teal-200",
  insurance: "bg-orange-50 text-orange-600 border-orange-200",
  other:     "bg-slate-50 text-slate-500 border-slate-200",
};

const statusColors: Record<VendorStatus, string> = {
  active:   "bg-emerald-100 text-emerald-700",
  pending:  "bg-amber-100 text-amber-700",
  inactive: "bg-slate-100 text-slate-500",
};

const VENDOR_TYPES: VendorType[] = ["clinic", "lender", "pharmacy", "lab", "insurance", "other"];
const VENDOR_STATUSES: VendorStatus[] = ["active", "pending", "inactive"];

// ── Add Vendor Dialog ─────────────────────────────────────────────────────────

function AddVendorDialog({
  caseId,
  allVendors,
  linkedVendorIds,
}: {
  caseId: string;
  allVendors: Vendor[];
  linkedVendorIds: Set<string>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [isPending, startTransition] = useTransition();

  // Existing mode
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [linkStatus, setLinkStatus] = useState<VendorStatus>("active");
  const [linkNotes, setLinkNotes] = useState("");

  // New mode
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<VendorType>("clinic");
  const [newNotes, setNewNotes] = useState("");
  const [newStatus, setNewStatus] = useState<VendorStatus>("active");

  const availableVendors = allVendors.filter((v) => !linkedVendorIds.has(v.id));

  function reset() {
    setSelectedVendorId("");
    setLinkStatus("active");
    setLinkNotes("");
    setNewName("");
    setNewType("clinic");
    setNewNotes("");
    setNewStatus("active");
  }

  function handleLinkExisting() {
    if (!selectedVendorId) return;
    startTransition(async () => {
      await addVendorToCase(caseId, selectedVendorId, linkStatus, linkNotes);
      reset();
      setOpen(false);
      router.refresh();
    });
  }

  function handleCreateNew() {
    if (!newName.trim()) return;
    startTransition(async () => {
      const vendor = await createVendor({ name: newName.trim(), vendor_type: newType, notes: newNotes || undefined });
      await addVendorToCase(caseId, vendor.id, newStatus);
      reset();
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4" /> Add Vendor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Vendor to Case</DialogTitle>
        </DialogHeader>

        {/* Mode toggle */}
        <div className="flex rounded-lg border p-0.5 bg-muted/40 w-fit">
          {(["existing", "new"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-medium transition-colors",
                mode === m
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "existing" ? "Link Existing" : "Create New"}
            </button>
          ))}
        </div>

        {mode === "existing" ? (
          <div className="space-y-3">
            {availableVendors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                All vendors are already linked, or no vendors exist. Use "Create New" to add one.
              </p>
            ) : (
              <>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Vendor</label>
                  <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vendor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVendors.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} — {VENDOR_TYPE_LABELS[v.vendor_type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                  <Select value={linkStatus} onValueChange={(v) => setLinkStatus(v as VendorStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {VENDOR_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Notes (optional)</label>
                  <Textarea
                    value={linkNotes}
                    onChange={(e) => setLinkNotes(e.target.value)}
                    placeholder="e.g. Preferred partner, special rates..."
                    rows={2}
                  />
                </div>
                <Button
                  onClick={handleLinkExisting}
                  disabled={!selectedVendorId || isPending}
                  className="w-full"
                >
                  {isPending ? "Linking..." : "Link to Case"}
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              placeholder="Vendor name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                <Select value={newType} onValueChange={(v) => setNewType(v as VendorType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VENDOR_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{VENDOR_TYPE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as VendorStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VENDOR_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Textarea
              placeholder="Notes (optional)"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={2}
            />
            <Button onClick={handleCreateNew} disabled={!newName.trim() || isPending} className="w-full">
              {isPending ? "Creating..." : "Create & Link"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Vendor Card ───────────────────────────────────────────────────────────────

function VendorCard({ cv, caseId }: { cv: CaseVendor; caseId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const vendor = cv.vendor!;
  const vtype = vendor.vendor_type;

  function handleStatusChange(status: VendorStatus) {
    setShowStatusMenu(false);
    startTransition(async () => {
      await updateCaseVendorStatus(cv.id, caseId, status);
      router.refresh();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeVendorFromCase(cv.id, caseId);
      router.refresh();
    });
  }

  return (
    <div className={cn("relative rounded-lg border p-4 flex flex-col gap-2", typeColor[vtype])}>
      {/* Remove button */}
      <button
        onClick={handleRemove}
        disabled={isPending}
        className="absolute top-2.5 right-2.5 rounded p-0.5 hover:bg-black/10 text-current opacity-50 hover:opacity-100 transition-opacity"
        title="Remove vendor"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-2 pr-5">
        <div className="mt-0.5 shrink-0">{typeIcon[vtype]}</div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug truncate">{vendor.name}</p>
          <p className="text-xs opacity-70">{VENDOR_TYPE_LABELS[vtype]}</p>
        </div>
      </div>

      {/* Status badge + changer */}
      <div className="relative">
        <button
          onClick={() => setShowStatusMenu((s) => !s)}
          className={cn(
            "flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium",
            statusColors[cv.status]
          )}
        >
          <span className="capitalize">{cv.status}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
        {showStatusMenu && (
          <div className="absolute left-0 top-full mt-1 z-10 bg-background border rounded-md shadow-md py-1 min-w-[110px]">
            {VENDOR_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={cn(
                  "w-full text-left px-3 py-1.5 text-xs hover:bg-accent capitalize",
                  cv.status === s && "font-medium"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      {(cv.notes || vendor.notes) && (
        <p className="text-xs opacity-70 leading-snug">
          {cv.notes || vendor.notes}
        </p>
      )}
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export function VendorsList({
  caseVendors,
  allVendors,
  caseId,
}: {
  caseVendors: CaseVendor[];
  allVendors: Vendor[];
  caseId: string;
}) {
  const linkedVendorIds = new Set(caseVendors.map((cv) => cv.vendor_id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {caseVendors.length === 0 ? "No vendors linked yet" : `${caseVendors.length} linked`}
        </p>
        <AddVendorDialog caseId={caseId} allVendors={allVendors} linkedVendorIds={linkedVendorIds} />
      </div>

      {caseVendors.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {caseVendors.map((cv) => (
            <VendorCard key={cv.id} cv={cv} caseId={caseId} />
          ))}
        </div>
      )}
    </div>
  );
}
