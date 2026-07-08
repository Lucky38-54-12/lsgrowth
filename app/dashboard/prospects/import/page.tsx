"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import { parseApolloCsv, ApolloRow } from "@/lib/parseApolloCsv";
import { scoreProspect } from "@/lib/qualify";
import { importProspects } from "../actions";

const L = { surface: "#ffffff", border: "#e2e8f0", text: "#0f172a", muted: "#64748b", dimmed: "#94a3b8" };
const SCORE_COLORS: Record<string, { bg: string; text: string }> = {
  strong: { bg: "#dcfce7", text: "#166534" },
  maybe: { bg: "#fef9c3", text: "#854d0e" },
  disqualify: { bg: "#fee2e2", text: "#991b1b" },
};

export default function ImportProspectsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ApolloRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseApolloCsv(String(reader.result || ""));
        if (parsed.length === 0) setError("No rows found — check the CSV has a header row and a company/organization column.");
        setRows(parsed);
      } catch {
        setError("Couldn't parse that file. Make sure it's a CSV export.");
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    setImporting(true);
    setError("");
    try {
      const { imported } = await importProspects(rows);
      router.push(`/dashboard/prospects?flash=${encodeURIComponent(`Imported ${imported} prospect${imported !== 1 ? "s" : ""}.`)}`);
    } catch {
      setError("Import failed — check server logs.");
      setImporting(false);
    }
  }

  return (
    <div>
      <Topbar title="Import Prospects" subtitle="Upload an Apollo.io CSV export — column names are matched loosely" />

      <div style={{ maxWidth: 960, margin: "32px auto", padding: "0 28px" }}>
        {error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "10px 16px", marginBottom: 18, fontSize: 14 }}>{error}</div>}

        <div style={{ background: L.surface, border: `1px solid ${L.border}`, padding: 24, marginBottom: 20 }}>
          <label>CSV file</label>
          <input type="file" accept=".csv" onChange={handleFile} />
          {fileName && <p style={{ fontSize: 12.5, color: L.dimmed, marginTop: 8 }}>{fileName} — {rows.length} row{rows.length !== 1 ? "s" : ""} parsed</p>}
        </div>

        {rows.length > 0 && (
          <div style={{ background: L.surface, border: `1px solid ${L.border}`, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: L.text }}>Preview — first 25 of {rows.length}</div>
              <button
                onClick={handleImport}
                disabled={importing}
                className="btn-lift"
                style={{ padding: "9px 18px", background: importing ? "#fca5a5" : "var(--red)", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: importing ? "default" : "pointer" }}
              >{importing ? "Importing…" : `Import ${rows.length} prospect${rows.length !== 1 ? "s" : ""}`}</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${L.border}`, textAlign: "left" }}>
                    {["Company", "Contact", "Email", "Employees", "Score", "Location", "Industry"].map(h => (
                      <th key={h} style={{ padding: "6px 10px", color: L.muted, fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 25).map((r, i) => {
                    const { score } = scoreProspect({ employee_count: r.employee_count, trade: r.trade, location: r.location });
                    const sc = SCORE_COLORS[score];
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${L.border}` }}>
                        <td style={{ padding: "6px 10px", fontWeight: 600 }}>{r.company}</td>
                        <td style={{ padding: "6px 10px" }}>{r.contact_name || "—"}</td>
                        <td style={{ padding: "6px 10px", color: L.muted }}>{r.email || "—"}</td>
                        <td style={{ padding: "6px 10px" }}>{r.employee_count ?? "—"}</td>
                        <td style={{ padding: "6px 10px" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: sc.bg, color: sc.text }}>{score}</span>
                        </td>
                        <td style={{ padding: "6px 10px", color: L.muted }}>{r.location || "—"}</td>
                        <td style={{ padding: "6px 10px", color: L.muted }}>{r.trade || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
