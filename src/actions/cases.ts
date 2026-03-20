"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Case, CaseDetail, CaseStage, CaseStatus, JourneyType, Urgency, OverdueCaseTask } from "@/types";

export async function getCases(): Promise<Case[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCaseById(id: string): Promise<CaseDetail | null> {
  const supabase = await createClient();

  const { data: caseData, error: caseError } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .single();

  if (caseError || !caseData) return null;

  // Fetch all related data in parallel
  const [
    { data: stageHistory },
    { data: tasks },
    { data: notes },
    { data: documents },
    { data: caseVendors },
    { data: aiSummaries },
  ] = await Promise.all([
    supabase.from("case_stage_history").select("*").eq("case_id", id).order("entered_at"),
    supabase.from("tasks").select("*").eq("case_id", id).order("due_at", { ascending: true }),
    supabase.from("notes").select("*").eq("case_id", id).order("created_at", { ascending: false }),
    supabase.from("documents").select("*").eq("case_id", id).order("created_at", { ascending: false }),
    supabase.from("case_vendors").select("*, vendor:vendors(*)").eq("case_id", id),
    supabase.from("ai_summaries").select("*").eq("case_id", id).order("created_at", { ascending: false }),
  ]);

  return {
    ...caseData,
    stage_history: stageHistory ?? [],
    tasks: tasks ?? [],
    notes: notes ?? [],
    documents: documents ?? [],
    case_vendors: caseVendors ?? [],
    ai_summaries: aiSummaries ?? [],
  };
}

export async function getDashboardStats() {
  const supabase = await createClient();

  const [
    { count: totalCases },
    { count: activeCases },
    { count: blockedCases },
    { count: overdueTasks },
  ] = await Promise.all([
    supabase.from("cases").select("*", { count: "exact", head: true }),
    supabase.from("cases").select("*", { count: "exact", head: true }).eq("current_status", "active"),
    supabase.from("cases").select("*", { count: "exact", head: true }).eq("current_status", "blocked"),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .lt("due_at", new Date().toISOString())
      .neq("status", "done")
      .neq("status", "cancelled"),
  ]);

  return {
    total_cases: totalCases ?? 0,
    active_cases: activeCases ?? 0,
    blocked_cases: blockedCases ?? 0,
    overdue_tasks: overdueTasks ?? 0,
  };
}

export async function getRecentCases(limit = 5): Promise<Case[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cases")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getBlockedCases(): Promise<Case[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cases")
    .select("*")
    .eq("current_status", "blocked")
    .order("updated_at", { ascending: false });
  return data ?? [];
}

export async function getOverdueTasks(): Promise<OverdueCaseTask[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*, cases(client_name)")
    .lt("due_at", new Date().toISOString())
    .neq("status", "done")
    .neq("status", "cancelled")
    .order("due_at", { ascending: true })
    .limit(10);
  return (data ?? []) as OverdueCaseTask[];
}

export async function createCase(formData: {
  client_name: string;
  journey_type: JourneyType;
  current_stage: CaseStage;
  owner_name: string;
  urgency: Urgency;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .insert({
      ...formData,
      current_status: "active" as CaseStatus,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Record initial stage history
  await supabase.from("case_stage_history").insert({
    case_id: data.id,
    stage_name: formData.current_stage,
    entered_at: new Date().toISOString(),
  });

  revalidatePath("/cases");
  revalidatePath("/dashboard");
  return data;
}

export async function updateCase(
  id: string,
  updates: Partial<Pick<Case, "current_stage" | "current_status" | "urgency" | "next_step" | "blocker_note" | "owner_name">>
) {
  const supabase = await createClient();

  // If stage changed, close previous stage and open new one
  if (updates.current_stage) {
    const { data: currentCase } = await supabase
      .from("cases")
      .select("current_stage")
      .eq("id", id)
      .single();

    if (currentCase && currentCase.current_stage !== updates.current_stage) {
      const now = new Date().toISOString();
      await supabase
        .from("case_stage_history")
        .update({ exited_at: now })
        .eq("case_id", id)
        .is("exited_at", null);

      await supabase.from("case_stage_history").insert({
        case_id: id,
        stage_name: updates.current_stage,
        entered_at: now,
      });
    }
  }

  const { error } = await supabase
    .from("cases")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/cases/${id}`);
  revalidatePath("/cases");
  revalidatePath("/dashboard");
}
