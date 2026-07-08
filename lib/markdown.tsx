import React from "react";

// Small dependency-free renderer for the call-prep sheet markdown (headers, bold,
// bullet/numbered lists, horizontal rules, paragraphs). Not a general markdown engine.
function renderInline(text: string, key: string | number): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <React.Fragment key={key}>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </React.Fragment>
  );
}

export function renderMarkdown(md: string): React.ReactNode {
  const lines = (md || "").replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuffer: { ordered: boolean; text: string }[] = [];

  function flushList() {
    if (listBuffer.length === 0) return;
    const ordered = listBuffer[0].ordered;
    const Tag = ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={`list-${blocks.length}`} style={{ margin: "6px 0 14px", paddingLeft: 22, display: "flex", flexDirection: "column", gap: 4 }}>
        {listBuffer.map((item, i) => (
          <li key={i} style={{ fontSize: 13.5, lineHeight: 1.6, color: "#1e293b" }}>{renderInline(item.text, i)}</li>
        ))}
      </Tag>
    );
    listBuffer = [];
  }

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (trimmed === "") {
      flushList();
      return;
    }
    if (/^---+$/.test(trimmed)) {
      flushList();
      blocks.push(<hr key={idx} style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "18px 0" }} />);
      return;
    }
    const h = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flushList();
      const level = h[1].length;
      const sizes: Record<number, number> = { 1: 24, 2: 18, 3: 15, 4: 13.5 };
      const style: React.CSSProperties = {
        fontSize: sizes[level] || 14,
        fontWeight: level <= 2 ? 900 : 800,
        color: "#0f172a",
        marginTop: level === 1 ? 0 : 22,
        marginBottom: 8,
        letterSpacing: level >= 3 ? "0.01em" : undefined,
      };
      const Tag = (`h${level}` as unknown) as keyof JSX.IntrinsicElements;
      blocks.push(React.createElement(Tag, { key: idx, style }, renderInline(h[2], idx)));
      return;
    }
    const ol = trimmed.match(/^\d+\.\s+(.*)$/);
    if (ol) {
      listBuffer.push({ ordered: true, text: ol[1] });
      return;
    }
    const ul = trimmed.match(/^[-*]\s+(.*)$/);
    if (ul) {
      listBuffer.push({ ordered: false, text: ul[1] });
      return;
    }
    flushList();
    blocks.push(
      <p key={idx} style={{ fontSize: 13.5, lineHeight: 1.65, color: "#1e293b", margin: "0 0 10px" }}>
        {renderInline(trimmed, idx)}
      </p>
    );
  });
  flushList();

  return <>{blocks}</>;
}
