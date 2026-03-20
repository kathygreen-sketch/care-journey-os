"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadDocument(caseId: string, formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  const documentType = formData.get("document_type") as string;
  const uploadedBy = formData.get("uploaded_by") as string;

  if (!file) throw new Error("No file provided");

  // Upload to Supabase Storage
  const fileName = `${caseId}/${Date.now()}-${file.name}`;
  const { data: storageData, error: storageError } = await supabase.storage
    .from("documents")
    .upload(fileName, file);

  if (storageError) throw new Error(storageError.message);

  // Get public URL
  const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(fileName);

  // Save record to DB
  const { error: dbError } = await supabase.from("documents").insert({
    case_id: caseId,
    document_type: documentType,
    file_url: publicUrl,
    uploaded_by: uploadedBy,
  });

  if (dbError) throw new Error(dbError.message);

  revalidatePath(`/cases/${caseId}`);
  return { url: publicUrl, path: storageData.path };
}

export async function deleteDocument(documentId: string, caseId: string, fileUrl: string) {
  const supabase = await createClient();

  // Extract storage path from public URL: …/object/public/documents/<path>
  const marker = "/object/public/documents/";
  const storagePath = fileUrl.includes(marker) ? fileUrl.split(marker)[1] : null;

  if (storagePath) {
    await supabase.storage.from("documents").remove([storagePath]);
  }

  const { error } = await supabase.from("documents").delete().eq("id", documentId);
  if (error) throw new Error(error.message);
  revalidatePath(`/cases/${caseId}`);
}
