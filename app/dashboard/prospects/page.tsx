import { createSupabaseClient, fetchAllRows } from "@/lib/supabase";
import { Lead } from "@/lib/types";
import Topbar from "@/components/Topbar";
import ProspectRow from "./ProspectRow";
import Link from "next/link";
import { Upload } from "lucide-react";

const L = { surface: "#ffffff", border: "#e2e8f0", text: "#0f172a", muted: "#64748b", dimmed: "#94a3b8" };
const SCORE_RANK: Record<string, number> = { strong: 0, maybe: 1, disqualify: 2 };

export const revalidate = 0;

export default async function ProspectsPage({ searchParams }: { searchParams: { view?: string; q?: string } }) {
  const sb = createSupabaseClient();
  const leads = await fetchAllRows<Lead>((from, to) =>
    sb.from("leads").select("*").not("qualification_score", "is", null).order("date_added", { ascending: false }).range(from, to)
  );

  const view = searchParams?.view === "archived" ? "archived" : "active";
  const q = (searchParams?.q || "").trim().toLowerCase();

  let filtered = leads.filter(l => (view === "archived" ? l.qualification_score === "disqualify" : l.qualification_score !== "disqualify"));
  if (q) {
    filtered = filtered.filter(l =>
      l.company.toLowerCase().includes(q) || (l.trade || "").toLowerCase().includes(q) || (l.location || "").toLowerCase().includes(q)
    );
  }
  filtered.sort((a, b) => {
    const rankDiff = (SCORE_RANK[a.qualification_score || "maybe"] ?? 1) - (SCORE_RANK[b.qualification_score || "maybe"] ?? 1);
    if (rankDiff !== 0) return rankDiff;
    return (b.employee_count || 0) - (a.employee_count || 0);
  });

  const strong = leads.filter(l => l.qualification_score === "strong").length;
  const maybe = leads.filter(l => l.qualification_score === "maybe").length;
  const disqualified = leads.filter(l => l.qualification_score === "disqualify").length;

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh" }}>
      <Topbar title="Prospects" subtitle={`${strong} strong · ${maybe} maybe · ${disqualified} archived`} />

      <div style={{ padding: "20px 28px 60px", display: "flex", flexDirection: "column", gap: 12, maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <form method="get" style={{ flex: 1, minWidth: 160 }}>
            {view === "archived" && <input type="hidden" name="view" value="archived" />}
            <input type="text" name="q" defaultValue={searchParams?.q || ""} placeholder="Search by business, trade, location…" />
          </form>
          <Link href="/dashboard/prospects/import" className="btn-lift" style={{
            display: "flex", alignItems: "center", gap: 6, background: "var(--red)", color: "#fff",
            border: "none", padding: "9px 18px", fontSize: 12.5, fontWeight: 700, textDecoration: "none", flexShrink: 0,
          }}>
            <Upload style={{ width: 13, height: 13 }} /> Import CSV
          </Link>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {[{ key: "active", label: `Call queue (${strong + maybe})` }, { key: "archived", label: `Archived (${disqualified})` }].map(t => (
            <Link key={t.key} href={`/dashboard/prospects${t.key === "active" ? "" : "?view=archived"}`} style={{
              padding: "6px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none",
              border: `1px solid ${view === t.key ? "var(--red)" : L.border}`,
              background: view === t.key ? "#fef2f2" : L.surface,
              color: view === t.key ? "var(--red)" : L.muted,
            }}>{t.label}</Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: L.surface, border: `1px solid ${L.border}`, padding: 40, textAlign: "center", color: L.dimmed, fontSize: 13 }}>
            {view === "archived" ? "No archived prospects." : "No prospects yet — import a CSV to get started."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(lead => <ProspectRow key={lead.lead_id} lead={lead} archived={view === "archived"} />)}
          </div>
        )}
      </div>
    </div>
  );
}
