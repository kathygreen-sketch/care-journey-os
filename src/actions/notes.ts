"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { NoteType } from "@/types";

export async function createNote(caseId: string, formData: {
  author_name: string;
  body: string;
  note_type: NoteType;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("notes").insert({
    case_id: caseId,
    ...formData,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/cases/${caseId}`);
}

export async function deleteNote(noteId: string, caseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("notes").delete().eq("id", noteId);
  if (error) throw new Error(error.message);
  revalidatePath(`/cases/${caseId}`);
}
