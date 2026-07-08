"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CallPrepSheet, Lead, LeadStatus, OnboardingItemStatus } from "@/lib/types";
import { CALL_PREP_NICHES } from "@/lib/types";
import { creativeBriefFor } from "@/lib/creativeBriefs";
import { onboardingEmailPrompt } from "@/lib/prompts/onboarding";
import { nurturePrompt } from "@/lib/prompts/nurture";
import { setStage, saveOnboardingChecklist, saveOnboardingEmailDraft, setThinkingFollowupDate } from "./actions";
import { Copy, Check } from "lucide-react";

const L = { surface: "#ffffff", border: "#e2e8f0", text: "#0f172a", muted: "#64748b", dimmed: "#94a3b8" };

const STAGE_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "booked", label: "Discovery booked" },
  { value: "discovery_done", label: "Discovery done" },
  { value: "proposal_sent", label: "Proposal sent" },
  { value: "thinking_about_it", label: "Thinking" },
  { value: "onboarding", label: "Onboarding (won)" },
  { value: "ready_to_launch", label: "Ready to launch" },
  { value: "active", label: "Active" },
  { value: "cold", label: "Cold / lost" },
];

function guessNiche(trade: string | null): string {
  const t = (trade || "").toLowerCase();
  if (t.includes("clean")) return "Cleaning";
  if (t.includes("electric") || t.includes("spark")) return "Electrical";
  if (t.includes("outdoor") || t.includes("landscap") || t.includes("deck")) return "Outdoor Living";
  if (t.includes("build") || t.includes("construct") || t.includes("trade") || t.includes("carpentr")) return "Trades/Construction";
  return "Other";
}

export default function OnboardingPanel({ lead, callPrepSheet }: { lead: Lead; callPrepSheet: CallPrepSheet | null }) {
  const router = useRouter();
  const [stage, setStageLocal] = useState<LeadStatus>(lead.status);
  const [services, setServices] = useState(lead.onboarding_services || "");
  const [adsStatus, setAdsStatus] = useState<OnboardingItemStatus>(lead.ads_manager_status || "not_requested");
  const [budget, setBudget] = useState(lead.ad_budget != null ? String(lead.ad_budget) : "");
  const [creativesStatus, setCreativesStatus] = useState<OnboardingItemStatus>(lead.creatives_status || "not_requested");
  const [niche, setNiche] = useState(guessNiche(lead.trade));
  const [emailDraft, setEmailDraft] = useState(lead.onboarding_email_draft || "");
  const [followupDate, setFollowupDate] = useState(lead.thinking_followup_date || "");
  const [copiedOnboarding, setCopiedOnboarding] = useState(false);
  const [copiedNurture, setCopiedNurture] = useState(false);
  const [saving, setSaving] = useState(false);

  const allFourDone = !!services.trim() && adsStatus === "granted" && !!budget && creativesStatus === "received";

  async function handleStageChange(next: LeadStatus) {
    setStageLocal(next);
    await setStage(lead.lead_id, next);
    router.refresh();
  }

  async function handleSaveChecklist() {
    setSaving(true);
    const fd = new FormData();
    fd.set("onboarding_services", services);
    fd.set("ads_manager_status", adsStatus);
    fd.set("ad_budget", budget);
    fd.set("creatives_status", creativesStatus);
    await saveOnboardingChecklist(lead.lead_id, fd);
    setSaving(false);
    router.refresh();
  }

  async function handleMarkReadyToLaunch() {
    await handleStageChange("ready_to_launch");
  }

  async function handleCopyOnboardingPrompt() {
    await navigator.clipboard.writeText(onboardingEmailPrompt(lead, niche));
    setCopiedOnboarding(true);
    setTimeout(() => setCopiedOnboarding(false), 1200);
  }

  async function handleSaveDraft() {
    await saveOnboardingEmailDraft(lead.lead_id, emailDraft);
    router.refresh();
  }

  async function handleCopyNurturePrompt() {
    await navigator.clipboard.writeText(nurturePrompt(lead, callPrepSheet?.sheet_markdown || null));
    setCopiedNurture(true);
    setTimeout(() => setCopiedNurture(false), 1200);
  }

  async function handleSaveFollowupDate() {
    await setThinkingFollowupDate(lead.lead_id, followupDate);
    router.refresh();
  }

  return (
    <div style={{ background: L.surface, border: `1px solid ${L.border}`, padding: 24, marginBottom: 20 }}>
      <div style={{ fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", color: L.muted, fontWeight: 800, marginBottom: 12 }}>
        Onboarding Pipeline
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Stage</label>
        <select value={stage} onChange={e => handleStageChange(e.target.value as LeadStatus)}>
          {STAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {stage === "thinking_about_it" && (
        <div style={{ background: "#faf5ff", border: "1px solid #ddd6fe", padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6d28d9", marginBottom: 8 }}>Nurture follow-up</div>
          <label>Follow-up date</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="date" value={followupDate} onChange={e => setFollowupDate(e.target.value)} />
            <button onClick={handleSaveFollowupDate} className="btn-lift" style={{ padding: "6px 14px", background: "#6d28d9", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Save</button>
          </div>
          <button onClick={handleCopyNurturePrompt} className="btn-lift" style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#fff", border: "1px solid #ddd6fe", fontSize: 12, fontWeight: 700, color: "#6d28d9", cursor: "pointer" }}>
            {copiedNurture ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
            {copiedNurture ? "Copied" : "Copy nurture prompt"}
          </button>
        </div>
      )}

      {(stage === "onboarding" || stage === "ready_to_launch" || stage === "active") && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label>3 services to start with</label>
              <input value={services} onChange={e => setServices(e.target.value)} placeholder="e.g. end of tenancy, house wash, carpet steam" />
            </div>
            <div>
              <label>Niche (for creative brief)</label>
              <select value={niche} onChange={e => setNiche(e.target.value)}>
                {CALL_PREP_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label>Ads Manager access</label>
              <select value={adsStatus} onChange={e => setAdsStatus(e.target.value as OnboardingItemStatus)}>
                <option value="not_requested">Not requested</option>
                <option value="requested">Requested</option>
                <option value="granted">Granted</option>
              </select>
            </div>
            <div>
              <label>Ad budget confirmed ($/mo)</label>
              <input value={budget} onChange={e => setBudget(e.target.value)} type="number" placeholder="e.g. 800" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label>Creatives</label>
              <select value={creativesStatus} onChange={e => setCreativesStatus(e.target.value as OnboardingItemStatus)}>
                <option value="not_requested">Not requested</option>
                <option value="requested">Requested</option>
                <option value="received">Received</option>
              </select>
              <p style={{ fontSize: 11.5, color: L.dimmed, marginTop: 6 }}>Brief for {niche}: {creativeBriefFor(niche)}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button onClick={handleSaveChecklist} disabled={saving} className="btn-lift" style={{ padding: "9px 18px", background: "#0f172a", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {saving ? "Saving…" : "Save checklist"}
            </button>
            {allFourDone && stage === "onboarding" && (
              <button onClick={handleMarkReadyToLaunch} className="btn-lift" style={{ padding: "9px 18px", background: "var(--green, #16a34a)", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Mark ready to launch
              </button>
            )}
          </div>

          <div style={{ borderTop: `1px solid ${L.border}`, paddingTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ margin: 0 }}>Onboarding email draft</label>
              <button onClick={handleCopyOnboardingPrompt} className="btn-lift" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", fontSize: 11.5, fontWeight: 700, color: "#1e3a5f", cursor: "pointer" }}>
                {copiedOnboarding ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                {copiedOnboarding ? "Copied" : "Copy onboarding email prompt"}
              </button>
            </div>
            <textarea value={emailDraft} onChange={e => setEmailDraft(e.target.value)} rows={8} placeholder="Paste the drafted onboarding email here — review before sending manually." />
            <button onClick={handleSaveDraft} className="btn-lift" style={{ marginTop: 8, padding: "8px 16px", background: "#0f172a", color: "#fff", border: "none", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Save draft</button>
          </div>
        </>
      )}
    </div>
  );
}
