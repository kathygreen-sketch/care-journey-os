"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { VendorType, VendorStatus } from "@/types";

export async function getVendors() {
  const supabase = await createClient();
  const { data } = await supabase.from("vendors").select("*").order("name");
  return data ?? [];
}

export async function createVendor(formData: {
  name: string;
  vendor_type: VendorType;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("vendors").insert(formData).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function addVendorToCase(
  caseId: string,
  vendorId: string,
  status: VendorStatus = "active",
  notes?: string,
) {
  const supabase = await createClient();
  const { error } = await supabase.from("case_vendors").insert({
    case_id: caseId,
    vendor_id: vendorId,
    status,
    notes: notes || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/cases/${caseId}`);
}

export async function updateCaseVendorStatus(
  caseVendorId: string,
  caseId: string,
  status: VendorStatus,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("case_vendors")
    .update({ status })
    .eq("id", caseVendorId);
  if (error) throw new Error(error.message);
  revalidatePath(`/cases/${caseId}`);
}

export async function removeVendorFromCase(caseVendorId: string, caseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("case_vendors").delete().eq("id", caseVendorId);
  if (error) throw new Error(error.message);
  revalidatePath(`/cases/${caseId}`);
}
