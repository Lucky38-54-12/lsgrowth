"use server";
import { createSupabaseClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { generateLeadId } from "@/lib/leads";
import { scoreProspect } from "@/lib/qualify";
import { ApolloRow } from "@/lib/parseApolloCsv";

export async function importProspects(rows: ApolloRow[]) {
  if (rows.length === 0) return { imported: 0 };
  const sb = createSupabaseClient();

  const { data: existing } = await sb.from("leads").select("lead_id");
  const existingIds = new Set((existing || []).map((r: { lead_id: string }) => r.lead_id));

  const inserts = rows.map(row => {
    const lead_id = generateLeadId(row.company, existingIds);
    existingIds.add(lead_id);
    const { score, reason } = scoreProspect({ employee_count: row.employee_count, trade: row.trade, location: row.location });
    return {
      lead_id,
      company: row.company,
      contact_name: row.contact_name || "there",
      email: row.email,
      trade: row.trade,
      location: row.location,
      phone: row.phone || null,
      website: row.website || null,
      source: "apollo_import",
      status: "not_contacted",
      employee_count: row.employee_count,
      qualification_score: score,
      qualification_signals: reason,
    };
  });

  const { error } = await sb.from("leads").insert(inserts);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/prospects");
  return { imported: inserts.length };
}

export async function updateProspectDetails(leadId: string, formData: FormData) {
  "use server";
  const sb = createSupabaseClient();
  const employee_count_raw = String(formData.get("employee_count") || "").trim();
  const employee_count = employee_count_raw ? parseInt(employee_count_raw, 10) : null;
  const trade = String(formData.get("trade") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  const { score, reason } = scoreProspect({ employee_count, trade, location });

  const { error } = await sb
    .from("leads")
    .update({ employee_count, trade, location, notes, qualification_score: score, qualification_signals: reason })
    .eq("lead_id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/prospects");
}

export async function saveAiQualification(leadId: string, verdict: string, reason: string) {
  "use server";
  const sb = createSupabaseClient();
  const { error } = await sb
    .from("leads")
    .update({ ai_qualification_verdict: verdict, ai_qualification_reason: reason })
    .eq("lead_id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/prospects");
}

export async function setDisqualifyReason(leadId: string, reason: string) {
  "use server";
  const sb = createSupabaseClient();
  const { error } = await sb
    .from("leads")
    .update({ qualification_score: "disqualify", disqualify_reason: reason })
    .eq("lead_id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/prospects");
}

export async function requalify(leadId: string) {
  "use server";
  const sb = createSupabaseClient();
  const { data: lead } = await sb.from("leads").select("employee_count, trade, location").eq("lead_id", leadId).single();
  if (!lead) return;
  const { score, reason } = scoreProspect(lead);
  const { error } = await sb
    .from("leads")
    .update({ qualification_score: score, qualification_signals: reason, disqualify_reason: null })
    .eq("lead_id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/prospects");
}
