"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Case, CaseStatus, CaseStage } from "@/types";
import {
  STAGE_LABELS,
  STATUS_LABELS,
  JOURNEY_TYPE_LABELS,
  URGENCY_LABELS,
  formatRelative,
} from "@/lib/utils";
import { Search } from "lucide-react";

const urgencyColors: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-400",
  medium: "bg-yellow-400",
  low: "bg-slate-300",
};

const statusVariant: Record<CaseStatus, "active" | "blocked" | "on_hold" | "completed" | "cancelled"> = {
  active: "active",
  blocked: "blocked",
  on_hold: "on_hold",
  completed: "completed",
  cancelled: "cancelled",
};

export function CaseTable({
  cases,
  initialStatus = "all",
  initialStage = "all",
}: {
  cases: Case[];
  initialStatus?: string;
  initialStage?: string;
}) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>(initialStage);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);

  const filtered = cases.filter((c) => {
    const matchesSearch =
      !search ||
      c.client_name.toLowerCase().includes(search.toLowerCase()) ||
      c.owner_name.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "all" || c.current_stage === stageFilter;
    const matchesStatus = statusFilter === "all" || c.current_status === statusFilter;
    return matchesSearch && matchesStage && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by client or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {Object.entries(STAGE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} cases</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Client</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Journey</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stage</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Urgency</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Owner</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No cases found.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <Link href={`/cases/${c.id}`} className="font-medium hover:underline">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${urgencyColors[c.urgency]}`}
                        />
                        {c.client_name}
                      </div>
                    </Link>
                    {c.blocker_note && (
                      <p className="mt-0.5 text-xs text-red-600 truncate max-w-[200px]">
                        {c.blocker_note}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {JOURNEY_TYPE_LABELS[c.journey_type]}
                  </td>
                  <td className="px-4 py-3.5">{STAGE_LABELS[c.current_stage]}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant={statusVariant[c.current_status]}>
                      {STATUS_LABELS[c.current_status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground capitalize">{c.urgency}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{c.owner_name}</td>
                  <td className="px-4 py-3.5 text-muted-foreground text-xs">
                    {formatRelative(c.updated_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
