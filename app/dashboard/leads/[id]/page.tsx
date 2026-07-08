import { createSupabaseClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import CallForm from "./CallForm";
import { CallPrepSheet, EmailEvent, EmailSend, Lead } from "@/lib/types";

export const revalidate = 0;

export default async function LeadCallPage({ params }: { params: { id: string } }) {
  const sb = createSupabaseClient();
  const [{ data: lead }, { data: events }, { data: sends }] = await Promise.all([
    sb.from("leads").select("*").eq("lead_id", params.id).single(),
    sb.from("email_events").select("*").eq("lead_id", params.id).order("created_at", { ascending: false }),
    sb.from("email_sends").select("*").eq("lead_id", params.id).order("sent_at", { ascending: false }),
  ]);
  if (!lead) notFound();

  let callPrepSheet: CallPrepSheet | null = null;
  if ((lead as Lead).call_prep_sheet_id) {
    const { data } = await sb.from("call_prep_sheets").select("*").eq("id", (lead as Lead).call_prep_sheet_id).single();
    callPrepSheet = (data as CallPrepSheet) || null;
  }

  return <CallForm lead={lead as Lead} events={(events || []) as EmailEvent[]} sends={(sends || []) as EmailSend[]} callPrepSheet={callPrepSheet} />;
}
