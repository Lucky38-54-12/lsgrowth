"use server";
import { createSupabaseClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { LeadStatus } from "@/lib/types";

export async function setStage(leadId: string, status: LeadStatus) {
  "use server";
  const sb = createSupabaseClient();
  const { error } = await sb.from("leads").update({ status }).eq("lead_id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/onboarding");
  revalidatePath(`/dashboard/leads/${leadId}`);
}

export async function saveOnboardingChecklist(leadId: string, formData: FormData) {
  "use server";
  const sb = createSupabaseClient();
  const onboarding_services = String(formData.get("onboarding_services") || "").trim() || null;
  const ads_manager_status = String(formData.get("ads_manager_status") || "not_requested");
  const ad_budget_raw = String(formData.get("ad_budget") || "").trim();
  const ad_budget = ad_budget_raw ? parseFloat(ad_budget_raw) : null;
  const creatives_status = String(formData.get("creatives_status") || "not_requested");

  const { error } = await sb
    .from("leads")
    .update({ onboarding_services, ads_manager_status, ad_budget, creatives_status })
    .eq("lead_id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/onboarding");
  revalidatePath(`/dashboard/leads/${leadId}`);
}

export async function saveOnboardingEmailDraft(leadId: string, draft: string) {
  "use server";
  const sb = createSupabaseClient();
  const { error } = await sb.from("leads").update({ onboarding_email_draft: draft }).eq("lead_id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/onboarding");
  revalidatePath(`/dashboard/leads/${leadId}`);
}

export async function setThinkingFollowupDate(leadId: string, date: string) {
  "use server";
  const sb = createSupabaseClient();
  const { error } = await sb.from("leads").update({ thinking_followup_date: date || null }).eq("lead_id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/onboarding");
}
