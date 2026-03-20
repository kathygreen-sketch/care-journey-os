"use server";

import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import { revalidatePath } from "next/cache";
import type { CaseDetail, AISummaryType } from "@/types";
import { STAGE_LABELS, JOURNEY_TYPE_LABELS } from "@/lib/utils";

// Build a structured case context string for the AI
function buildCaseContext(caseDetail: CaseDetail): string {
  const openTasks = caseDetail.tasks.filter((t) => t.status !== "done" && t.status !== "cancelled");
  const recentNotes = caseDetail.notes.slice(0, 5);

  return `
CLIENT: ${caseDetail.client_name}
JOURNEY: ${JOURNEY_TYPE_LABELS[caseDetail.journey_type] ?? caseDetail.journey_type}
CURRENT STAGE: ${STAGE_LABELS[caseDetail.current_stage] ?? caseDetail.current_stage}
STATUS: ${caseDetail.current_status}
URGENCY: ${caseDetail.urgency}
OWNER: ${caseDetail.owner_name}
NEXT STEP: ${caseDetail.next_step ?? "Not set"}
BLOCKER: ${caseDetail.blocker_note ?? "None"}

OPEN TASKS (${openTasks.length}):
${openTasks.map((t) => `- [${t.priority.toUpperCase()}] ${t.title}${t.due_at ? ` (due ${t.due_at.slice(0, 10)})` : ""}`).join("\n") || "None"}

VENDORS:
${caseDetail.case_vendors.map((cv) => `- ${cv.vendor?.name} (${cv.vendor?.vendor_type}) — ${cv.status}`).join("\n") || "None"}

RECENT NOTES:
${recentNotes.map((n) => `[${n.note_type.toUpperCase()}] ${n.author_name}: ${n.body}`).join("\n\n") || "None"}
`.trim();
}

export async function generateCaseSummary(caseId: string, caseDetail: CaseDetail): Promise<string> {
  const context = buildCaseContext(caseDetail);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `You are an operations copilot for a care journey coordination platform.

Summarize this case for an internal coordinator.

Return exactly in this format:
1. Current stage
2. Main objective
3. Biggest blocker
4. Top 3 next actions
5. Risks to monitor

Be concise, operational, and specific. Do not give medical advice.`,
      },
      {
        role: "user",
        content: `Case data:\n${context}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "";
  await saveSummary(caseId, "case_summary", content);
  revalidatePath(`/cases/${caseId}`);
  return content;
}

export async function generateNextStepPlan(caseId: string, caseDetail: CaseDetail): Promise<string> {
  const context = buildCaseContext(caseDetail);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `You are an operations planner for a high-stakes care journey.

Given the case data, generate a short next-step plan for the next 7 to 14 days.

Return:
- 3 to 7 milestones
- dependencies
- possible delays or blockers
- what the client should focus on now

Do not give medical advice. Focus on coordination and workflow.`,
      },
      {
        role: "user",
        content: `Case data:\n${context}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "";
  await saveSummary(caseId, "next_step_plan", content);
  revalidatePath(`/cases/${caseId}`);
  return content;
}

export async function generateNotesSummary(caseId: string, caseDetail: CaseDetail): Promise<string> {
  if (caseDetail.notes.length === 0) return "No notes to summarize.";

  const notesText = caseDetail.notes
    .slice(0, 20)
    .map((n) => `[${n.note_type.toUpperCase()} - ${n.author_name} - ${n.created_at.slice(0, 10)}]\n${n.body}`)
    .join("\n\n---\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `You are an internal case summarizer.

Read these notes and produce exactly:
1. Important events
2. Open questions
3. Outstanding actions
4. Escalations or concerns

Keep it concise and useful for handoff between team members.`,
      },
      {
        role: "user",
        content: `Notes:\n${notesText}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "";
  await saveSummary(caseId, "notes_summary", content);
  revalidatePath(`/cases/${caseId}`);
  return content;
}

async function saveSummary(caseId: string, type: AISummaryType, content: string) {
  const supabase = await createClient();
  await supabase.from("ai_summaries").insert({
    case_id: caseId,
    summary_type: type,
    content,
  });
}
