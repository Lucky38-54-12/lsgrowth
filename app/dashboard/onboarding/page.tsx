import { createSupabaseClient, fetchAllRows } from "@/lib/supabase";
import { Lead } from "@/lib/types";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import { Building2, RotateCcw } from "lucide-react";

const L = { surface: "#ffffff", border: "#e2e8f0", text: "#0f172a", muted: "#64748b", dimmed: "#94a3b8" };

export const revalidate = 0;

const COLUMNS: { key: string; label: string }[] = [
  { key: "booked", label: "Discovery Booked" },
  { key: "discovery_done", label: "Discovery Done" },
  { key: "proposal_sent", label: "Proposal Sent" },
  { key: "thinking_about_it", label: "Thinking" },
  { key: "onboarding", label: "Onboarding" },
  { key: "ready_to_launch", label: "Ready to Launch" },
  { key: "active", label: "Active" },
  { key: "cold", label: "Cold / Lost" },
];

function OnboardingCard({ lead }: { lead: Lead }) {
  const checklistDone = [
    !!lead.onboarding_services,
    lead.ads_manager_status === "granted",
    lead.ad_budget != null,
    lead.creatives_status === "received",
  ].filter(Boolean).length;

  return (
    <Link href={`/dashboard/leads/${lead.lead_id}`} className="card-hover" style={{
      display: "block", background: L.surface, border: `1px solid ${L.border}`, padding: "12px 14px", textDecoration: "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${L.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Building2 style={{ width: 12, height: 12, color: L.muted }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: L.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.company}</p>
          <p style={{ fontSize: 10, color: L.dimmed, marginTop: 1 }}>{lead.contact_name || "—"}</p>
        </div>
      </div>
      {lead.status === "onboarding" && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${L.border}`, fontSize: 10.5, fontWeight: 700, color: checklistDone === 4 ? "#166534" : L.dimmed }}>
          Checklist: {checklistDone}/4
        </div>
      )}
      {lead.status === "thinking_about_it" && lead.thinking_followup_date && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${L.border}`, fontSize: 10.5, color: "#6d28d9" }}>
          Follow up {lead.thinking_followup_date}
        </div>
      )}
    </Link>
  );
}

export default async function OnboardingPage() {
  const sb = createSupabaseClient();
  const leads = await fetchAllRows<Lead>((from, to) =>
    sb.from("leads").select("*").in("status", COLUMNS.map(c => c.key)).order("date_added", { ascending: false }).range(from, to)
  );

  const grouped: Record<string, Lead[]> = {};
  for (const col of COLUMNS) grouped[col.key] = [];
  for (const lead of leads) if (grouped[lead.status]) grouped[lead.status].push(lead);

  const today = new Date().toISOString().split("T")[0];
  const dueForFollowup = leads.filter(l => l.status === "thinking_about_it" && l.thinking_followup_date && l.thinking_followup_date <= today);

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh" }}>
      <Topbar title="Onboarding" subtitle={`${leads.length} in pipeline`} />

      <div style={{ padding: "20px 28px 60px", display: "flex", flexDirection: "column", gap: 16 }}>

        {dueForFollowup.length > 0 && (
          <div style={{ background: "#faf5ff", border: "1px solid #ddd6fe", padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <RotateCcw style={{ width: 14, height: 14, color: "#6d28d9" }} />
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6d28d9" }}>
                Due for follow-up ({dueForFollowup.length})
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dueForFollowup.map(lead => (
                <Link key={lead.lead_id} href={`/dashboard/leads/${lead.lead_id}`} className="row-hover" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                  padding: "10px 14px", background: "#fff", border: "1px solid #ddd6fe", textDecoration: "none",
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: L.text }}>{lead.company}</div>
                    <div style={{ fontSize: 11, color: L.dimmed }}>Was due {lead.thinking_followup_date}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#6d28d9" }}>Open →</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, alignItems: "start" }}>
          {COLUMNS.map(col => (
            <div key={col.key} style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="surface-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: L.text }}>{col.label}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: L.text }}>{grouped[col.key].length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 80 }}>
                {grouped[col.key].length === 0 ? (
                  <div style={{ padding: 20, textAlign: "center", color: L.dimmed, fontSize: 12, background: "#f8fafc", border: `1px dashed ${L.border}` }}>Empty</div>
                ) : (
                  grouped[col.key].map(lead => <OnboardingCard key={lead.lead_id} lead={lead} />)
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
