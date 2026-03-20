"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TaskPriority, TaskStatus } from "@/types";

export async function createTask(caseId: string, formData: {
  title: string;
  description?: string;
  priority: TaskPriority;
  owner_name?: string;
  due_at?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    case_id: caseId,
    status: "todo" as TaskStatus,
    ...formData,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/cases/${caseId}`);
}

export async function updateTaskStatus(taskId: string, caseId: string, status: TaskStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", taskId);

  if (error) throw new Error(error.message);
  revalidatePath(`/cases/${caseId}`);
}

export async function updateTask(
  taskId: string,
  caseId: string,
  updates: {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    owner_name?: string | null;
    due_at?: string | null;
    status?: TaskStatus;
  }
) {
  const supabase = await createClient();
  const patch: Record<string, unknown> = { ...updates };
  if (updates.status === "done") patch.completed_at = new Date().toISOString();
  if (updates.status && updates.status !== "done") patch.completed_at = null;

  const { error } = await supabase.from("tasks").update(patch).eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath(`/cases/${caseId}`);
}
