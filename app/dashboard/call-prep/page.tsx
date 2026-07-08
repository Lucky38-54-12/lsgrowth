import { createSupabaseClient } from "@/lib/supabase";
import { CallPrepSheet } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import { Plus, FileText, ChevronRight, Search } from "lucide-react";

const L = { surface: "#ffffff", border: "#e2e8f0", text: "#0f172a", muted: "#64748b", dimmed: "#94a3b8" };

export const revalidate = 0;

export default async function CallPrepPage({ searchParams }: { searchParams: { q?: string } }) {
  const sb = createSupabaseClient();
  const { data } = await sb.from("call_prep_sheets").select("*").order("created_at", { ascending: false });
  const sheets = (data || []) as CallPrepSheet[];

  const q = (searchParams?.q || "").trim().toLowerCase();
  const filtered = q
    ? sheets.filter(s => s.business_name.toLowerCase().includes(q) || (s.contact_name || "").toLowerCase().includes(q))
    : sheets;

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh" }}>
      <Topbar title="Call Prep" subtitle={`${sheets.length} prep sheet${sheets.length !== 1 ? "s" : ""}`} />

      <div style={{ padding: "20px 28px 60px", display: "flex", flexDirection: "column", gap: 12, maxWidth: 900, margin: "0 auto" }}>
        <form method="get" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: L.dimmed }} />
            <input
              type="text" name="q" defaultValue={searchParams?.q || ""}
              placeholder="Search by business or contact…"
              style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, background: L.surface, border: `1px solid ${L.border}`, fontSize: 12.5 }}
            />
          </div>
          <Link href="/dashboard/call-prep/new" className="btn-lift" style={{
            display: "flex", alignItems: "center", gap: 6, background: "var(--red)", color: "#fff",
            border: "none", padding: "9px 18px", fontSize: 12.5, fontWeight: 700, textDecoration: "none", flexShrink: 0,
          }}>
            <Plus style={{ width: 13, height: 13 }} /> New Prep Sheet
          </Link>
        </form>

        {filtered.length === 0 ? (
          <div style={{ background: L.surface, border: `1px solid ${L.border}`, padding: 40, textAlign: "center", color: L.dimmed, fontSize: 13 }}>
            {sheets.length === 0 ? "No call prep sheets yet. Add a prospect to get started." : "No sheets match this search."}
          </div>
        ) : (
          <div style={{ background: L.surface, border: `1px solid ${L.border}` }}>
            {filtered.map((s, i) => (
              <Link key={s.id} href={`/dashboard/call-prep/${s.id}`} className="row-hover" style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", textDecoration: "none",
                borderBottom: i === filtered.length - 1 ? "none" : `1px solid ${L.border}`,
              }}>
                <div style={{ width: 30, height: 30, background: s.sheet_markdown ? "#dcfce7" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FileText style={{ width: 14, height: 14, color: s.sheet_markdown ? "#166534" : L.muted }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: L.text }}>{s.business_name}</div>
                  <div style={{ fontSize: 11.5, color: L.dimmed, marginTop: 2 }}>
                    {s.contact_name || "No contact set"}{s.call_datetime ? ` · ${s.call_datetime}` : ""} · added {formatDateTime(s.created_at)}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", flexShrink: 0,
                  background: s.sheet_markdown ? "#dcfce7" : "#fef9c3", color: s.sheet_markdown ? "#166534" : "#854d0e",
                }}>
                  {s.sheet_markdown ? "Ready" : "Awaiting research"}
                </span>
                <ChevronRight style={{ width: 14, height: 14, color: L.dimmed, flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
