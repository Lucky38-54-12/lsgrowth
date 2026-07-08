import Topbar from "@/components/Topbar";
import { CALL_PREP_NICHES } from "@/lib/types";
import { createProspect } from "../actions";

const L = { surface: "#ffffff", border: "#e2e8f0", text: "#0f172a", muted: "#64748b" };

export default function NewCallPrepPage({
  searchParams,
}: {
  searchParams: { lead_id?: string; business_name?: string; website?: string; contact_name?: string; phone?: string; email?: string; niche?: string; cold_call_notes?: string };
}) {
  const p = searchParams || {};
  return (
    <div>
      <Topbar title="New Call Prep" subtitle="Add the prospect — research and the filled sheet get pasted in on the next step" />

      <div style={{ maxWidth: 640, margin: "32px auto", padding: "0 28px" }}>
        <div style={{ background: L.surface, border: `1px solid ${L.border}`, borderRadius: 0, padding: 24 }}>
          <form action={createProspect} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {p.lead_id && <input type="hidden" name="lead_id" value={p.lead_id} />}
            <div>
              <label>Business name</label>
              <input name="business_name" required defaultValue={p.business_name || ""} placeholder="e.g. Impact Outdoors" />
            </div>
            <div>
              <label>Website URL</label>
              <input name="website" required defaultValue={p.website || ""} placeholder="e.g. impactoutdoors.co.nz" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label>Contact name</label>
                <input name="contact_name" defaultValue={p.contact_name || ""} placeholder="e.g. Dave" />
              </div>
              <div>
                <label>Contact role</label>
                <input name="contact_role" placeholder="e.g. Owner" />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label>Phone</label>
                <input name="phone" defaultValue={p.phone || ""} />
              </div>
              <div>
                <label>Email</label>
                <input name="email" type="email" defaultValue={p.email || ""} />
              </div>
            </div>
            <div>
              <label>Call date/time &amp; platform</label>
              <input name="call_datetime" placeholder="e.g. Tues 10:30am · Google Meet" />
            </div>
            <div>
              <label>Industry/niche</label>
              <select name="niche" defaultValue={p.niche || ""} style={{ width: "100%" }}>
                <option value="" disabled>Select…</option>
                {CALL_PREP_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label>Notes from cold call <span style={{ fontWeight: 400, color: "#94a3b8" }}>(pain points, who else is involved, what they've tried…)</span></label>
              <textarea name="cold_call_notes" rows={5} defaultValue={p.cold_call_notes || ""} placeholder="Anything the prospect said when booking the call" />
            </div>
            <div style={{ marginTop: 6, display: "flex", gap: 12 }}>
              <button type="submit" className="btn-lift" style={{
                padding: "11px 24px", background: "var(--red)", color: "#fff",
                border: "none", borderRadius: 0, fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}>Save prospect</button>
              <a href="/dashboard/call-prep" className="btn-lift" style={{
                padding: "11px 20px", background: "#f8fafc", color: L.text,
                border: `1px solid ${L.border}`, borderRadius: 0, fontSize: 14, fontWeight: 700,
                display: "inline-flex", alignItems: "center",
              }}>Cancel</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
