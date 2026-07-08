"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lead } from "@/lib/types";
import { qualifyPrompt } from "@/lib/prompts/qualify";
import { updateProspectDetails, saveAiQualification, setDisqualifyReason, requalify } from "./actions";
import { Copy, Check, Phone, ChevronDown, ChevronUp } from "lucide-react";

const L = { surface: "#ffffff", border: "#e2e8f0", text: "#0f172a", muted: "#64748b", dimmed: "#94a3b8" };
const SCORE_COLORS: Record<string, { bg: string; text: string }> = {
  strong: { bg: "#dcfce7", text: "#166534" },
  maybe: { bg: "#fef9c3", text: "#854d0e" },
  disqualify: { bg: "#fee2e2", text: "#991b1b" },
};

export default function ProspectRow({ lead, archived }: { lead: Lead; archived: boolean }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(lead.notes || "");
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [verdict, setVerdict] = useState(lead.ai_qualification_verdict || "");
  const [reason, setReason] = useState(lead.ai_qualification_reason || "");
  const [disqualifyReason, setDisqualifyReasonInput] = useState("");
  const [saving, setSaving] = useState(false);

  const sc = SCORE_COLORS[lead.qualification_score || "maybe"];

  async function handleCopyPhone() {
    if (!lead.phone) return;
    await navigator.clipboard.writeText(lead.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 1200);
  }

  async function handleCopyPrompt() {
    await navigator.clipboard.writeText(qualifyPrompt(lead));
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 1200);
  }

  async function handleSaveNotes() {
    setSaving(true);
    const fd = new FormData();
    fd.set("employee_count", lead.employee_count != null ? String(lead.employee_count) : "");
    fd.set("trade", lead.trade || "");
    fd.set("location", lead.location || "");
    fd.set("notes", notes);
    await updateProspectDetails(lead.lead_id, fd);
    setSaving(false);
    router.refresh();
  }

  async function handleSaveVerdict() {
    await saveAiQualification(lead.lead_id, verdict, reason);
    router.refresh();
  }

  async function handleDisqualify() {
    if (!disqualifyReason.trim()) return;
    await setDisqualifyReason(lead.lead_id, disqualifyReason.trim());
    router.refresh();
  }

  async function handleRequalify() {
    await requalify(lead.lead_id);
    router.refresh();
  }

  const bookHref = `/dashboard/call-prep/new?${new URLSearchParams({
    lead_id: lead.lead_id, business_name: lead.company, website: lead.website || "",
    contact_name: lead.contact_name || "", phone: lead.phone || "", email: lead.email || "",
    cold_call_notes: notes,
  }).toString()}`;

  return (
    <div style={{ background: L.surface, border: `1px solid ${L.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: L.text }}>{lead.company}</div>
          <div style={{ fontSize: 11.5, color: L.dimmed, marginTop: 2 }}>
            {lead.contact_name || "—"} · {lead.trade || "no trade"} · {lead.location || "no location"} · {lead.employee_count != null ? `${lead.employee_count} employees` : "team size unknown"}
          </div>
          {lead.qualification_signals && <div style={{ fontSize: 11, color: L.dimmed, marginTop: 2, fontStyle: "italic" }}>{lead.qualification_signals}</div>}
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", background: sc.bg, color: sc.text, flexShrink: 0 }}>
          {lead.qualification_score || "unscored"}
        </span>
        {lead.phone && (
          <button onClick={handleCopyPhone} className="btn-lift" style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", background: "#f8fafc", border: `1px solid ${L.border}`, fontSize: 11.5, fontWeight: 600, color: L.text, cursor: "pointer", flexShrink: 0 }}>
            {copiedPhone ? <Check style={{ width: 12, height: 12 }} /> : <Phone style={{ width: 12, height: 12 }} />}
            {lead.phone}
          </button>
        )}
        {!archived && (
          <a href={bookHref} className="btn-lift" style={{ padding: "7px 14px", background: "var(--red)", color: "#fff", fontSize: 11.5, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>
            Book discovery
          </a>
        )}
        <button onClick={() => setExpanded(e => !e)} style={{ background: "none", border: "none", cursor: "pointer", color: L.dimmed, display: "flex", flexShrink: 0 }}>
          {expanded ? <ChevronUp style={{ width: 16, height: 16 }} /> : <ChevronDown style={{ width: 16, height: 16 }} />}
        </button>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${L.border}`, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14, background: "#f8fafc" }}>
          {lead.disqualify_reason && (
            <div style={{ fontSize: 12, color: "#991b1b" }}><strong>Disqualified:</strong> {lead.disqualify_reason}</div>
          )}

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: L.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Cold call notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ width: "100%", marginTop: 4 }} />
            <button onClick={handleSaveNotes} disabled={saving} className="btn-lift" style={{ marginTop: 6, padding: "6px 14px", background: "#0f172a", color: "#fff", border: "none", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
              {saving ? "Saving…" : "Save notes"}
            </button>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: L.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>AI team-size check</label>
              <button onClick={handleCopyPrompt} className="btn-lift" style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "#eff6ff", border: "1px solid #bfdbfe", fontSize: 11, fontWeight: 700, color: "#1e3a5f", cursor: "pointer" }}>
                {copiedPrompt ? <Check style={{ width: 11, height: 11 }} /> : <Copy style={{ width: 11, height: 11 }} />}
                {copiedPrompt ? "Copied" : "Copy research prompt"}
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 8, marginTop: 6 }}>
              <select value={verdict} onChange={e => setVerdict(e.target.value)}>
                <option value="">Verdict…</option>
                <option value="qualified">Qualified</option>
                <option value="borderline">Borderline</option>
                <option value="one-man-band">One-man band</option>
              </select>
              <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason from research" />
            </div>
            <button onClick={handleSaveVerdict} className="btn-lift" style={{ marginTop: 6, padding: "6px 14px", background: "#0f172a", color: "#fff", border: "none", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
              Save verdict
            </button>
          </div>

          {!archived ? (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: L.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Disqualify</label>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <input value={disqualifyReason} onChange={e => setDisqualifyReasonInput(e.target.value)} placeholder="e.g. one-man band" style={{ flex: 1 }} />
                <button onClick={handleDisqualify} className="btn-lift" style={{ padding: "6px 14px", background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
                  Archive
                </button>
              </div>
            </div>
          ) : (
            <button onClick={handleRequalify} className="btn-lift" style={{ alignSelf: "flex-start", padding: "6px 14px", background: "#0f172a", color: "#fff", border: "none", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
              Re-qualify (recompute score)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
