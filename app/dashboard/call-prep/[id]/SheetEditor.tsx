"use client";
import { useState } from "react";
import { CallPrepSheet } from "@/lib/types";
import { renderMarkdown } from "@/lib/markdown";
import { saveSheetMarkdown } from "../actions";
import { callPrepPrompt } from "@/lib/prompts/call-prep";
import { Copy, Printer, Pencil, Check } from "lucide-react";

const L = { surface: "#ffffff", border: "#e2e8f0", text: "#0f172a", muted: "#64748b" };

export default function SheetEditor({ sheet }: { sheet: CallPrepSheet }) {
  const [editing, setEditing] = useState(!sheet.sheet_markdown);
  const [draft, setDraft] = useState(sheet.sheet_markdown || "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  async function handleSave() {
    setSaving(true);
    await saveSheetMarkdown(sheet.id, draft);
    setSaving(false);
    setEditing(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(sheet.sheet_markdown || draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleCopyPrompt() {
    await navigator.clipboard.writeText(callPrepPrompt(sheet));
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 1500);
  }

  return (
    <div>
      {!sheet.sheet_markdown && !editing ? null : null}

      {editing ? (
        <div style={{ background: L.surface, border: `1px solid ${L.border}`, padding: 24 }}>
          {!sheet.sheet_markdown && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "12px 16px", marginBottom: 16, fontSize: 12.5, color: "#1e3a5f", lineHeight: 1.6 }}>
              No sheet yet. Ask Claude Code in this project&apos;s chat to research and write it, then paste the result below.
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                <button type="button" onClick={handleCopyPrompt} className="btn-lift" style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#fff",
                  border: "1px solid #bfdbfe", fontSize: 11.5, fontWeight: 700, color: "#1e3a5f", cursor: "pointer",
                }}>
                  {promptCopied ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                  {promptCopied ? "Copied" : "Copy chat prompt"}
                </button>
              </div>
            </div>
          )}
          <label>Call sheet (markdown)</label>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={28}
            placeholder="Paste the generated call sheet here…"
            style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12.5, lineHeight: 1.6 }}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button type="button" onClick={handleSave} disabled={saving || !draft.trim()} className="btn-lift" style={{
              padding: "10px 20px", background: saving ? "#fca5a5" : "var(--red)", color: "#fff",
              border: "none", fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer",
            }}>{saving ? "Saving…" : "Save sheet"}</button>
            {sheet.sheet_markdown && (
              <button type="button" onClick={() => { setDraft(sheet.sheet_markdown || ""); setEditing(false); }} className="btn-lift" style={{
                padding: "10px 18px", background: "#f8fafc", color: L.text, border: `1px solid ${L.border}`, fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>Cancel</button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <button type="button" onClick={handleCopy} className="btn-lift" style={{
              display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#fff",
              border: `1px solid ${L.border}`, fontSize: 12.5, fontWeight: 700, color: L.text, cursor: "pointer",
            }}>
              {copied ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button type="button" onClick={() => window.print()} className="btn-lift" style={{
              display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#fff",
              border: `1px solid ${L.border}`, fontSize: 12.5, fontWeight: 700, color: L.text, cursor: "pointer",
            }}>
              <Printer style={{ width: 13, height: 13 }} /> Print / PDF
            </button>
            <button type="button" onClick={() => setEditing(true)} className="btn-lift" style={{
              display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#fff",
              border: `1px solid ${L.border}`, fontSize: 12.5, fontWeight: 700, color: L.text, cursor: "pointer",
            }}>
              <Pencil style={{ width: 13, height: 13 }} /> Edit / Regenerate
            </button>
          </div>
          <div style={{ background: L.surface, border: `1px solid ${L.border}`, padding: "28px 32px" }}>
            {renderMarkdown(sheet.sheet_markdown || "")}
          </div>
        </>
      )}
    </div>
  );
}
