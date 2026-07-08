import { createSupabaseClient } from "@/lib/supabase";
import { CallPrepSheet } from "@/lib/types";
import { notFound } from "next/navigation";
import Topbar from "@/components/Topbar";
import SheetEditor from "./SheetEditor";

const L = { surface: "#ffffff", border: "#e2e8f0", text: "#0f172a", muted: "#64748b", dimmed: "#94a3b8" };

export const revalidate = 0;

export default async function CallPrepSheetPage({ params }: { params: { id: string } }) {
  const sb = createSupabaseClient();
  const { data } = await sb.from("call_prep_sheets").select("*").eq("id", params.id).single();
  if (!data) notFound();
  const sheet = data as CallPrepSheet;

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh" }}>
      <Topbar title={sheet.business_name} subtitle={sheet.contact_name ? `${sheet.contact_name}${sheet.contact_role ? `, ${sheet.contact_role}` : ""}` : "Call prep sheet"} />

      <div style={{ padding: "20px 28px 60px", maxWidth: 820, margin: "0 auto" }}>
        <div className="no-print" style={{
          background: L.surface, border: `1px solid ${L.border}`, padding: "14px 18px", marginBottom: 16,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12.5,
        }}>
          <div><span style={{ color: L.dimmed }}>Website: </span><a href={sheet.website?.startsWith("http") ? sheet.website : `https://${sheet.website}`} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>{sheet.website}</a></div>
          <div><span style={{ color: L.dimmed }}>Niche: </span>{sheet.niche || "—"}</div>
          <div><span style={{ color: L.dimmed }}>Phone: </span>{sheet.phone || "—"}</div>
          <div><span style={{ color: L.dimmed }}>Email: </span>{sheet.email || "—"}</div>
          <div><span style={{ color: L.dimmed }}>Call: </span>{sheet.call_datetime || "—"}</div>
        </div>

        {sheet.cold_call_notes && (
          <div className="no-print" style={{ background: "#fef9c3", border: "1px solid #fde68a", padding: "12px 16px", marginBottom: 16, fontSize: 12.5, color: "#713f12" }}>
            <strong>Cold-call notes:</strong> {sheet.cold_call_notes}
          </div>
        )}

        <SheetEditor sheet={sheet} />
      </div>
    </div>
  );
}
