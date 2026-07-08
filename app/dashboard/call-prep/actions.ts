"use server";
import { createSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createProspect(formData: FormData) {
  const business_name = String(formData.get("business_name") || "").trim();
  const website = String(formData.get("website") || "").trim();
  if (!business_name || !website) throw new Error("Business name and website are required");
  const lead_id = String(formData.get("lead_id") || "").trim() || null;

  const sb = createSupabaseClient();
  const { data, error } = await sb
    .from("call_prep_sheets")
    .insert({
      business_name,
      website,
      contact_name: String(formData.get("contact_name") || "").trim() || null,
      contact_role: String(formData.get("contact_role") || "").trim() || null,
      phone: String(formData.get("phone") || "").trim() || null,
      email: String(formData.get("email") || "").trim() || null,
      call_datetime: String(formData.get("call_datetime") || "").trim() || null,
      niche: String(formData.get("niche") || "").trim() || null,
      cold_call_notes: String(formData.get("cold_call_notes") || "").trim() || null,
      lead_id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (lead_id) {
    await sb.from("leads").update({ call_prep_sheet_id: data.id }).eq("lead_id", lead_id);
  }

  revalidatePath("/dashboard/call-prep");
  redirect(`/dashboard/call-prep/${data.id}`);
}

export async function saveSheetMarkdown(id: string, markdown: string) {
  "use server";
  const sb = createSupabaseClient();
  const { error } = await sb
    .from("call_prep_sheets")
    .update({ sheet_markdown: markdown, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/call-prep/${id}`);
  revalidatePath("/dashboard/call-prep");
}
