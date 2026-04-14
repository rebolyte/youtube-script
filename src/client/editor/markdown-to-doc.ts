import { generateJSON, type Extensions } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import type { JSONContent } from "@tiptap/react";

type FlatSection = { key: string; label: string };

const innerExtensions: Extensions = [StarterKit];

export const markdownToSectionDoc = (
  md: string,
  flat: FlatSection[],
): JSONContent => {
  const lines = md.split("\n");
  const chunks: { label: string; body: string }[] = [];
  let current: { label: string; lines: string[] } | null = null;

  const flush = () => {
    if (current) chunks.push({ label: current.label, body: current.lines.join("\n").trim() });
  };

  for (const line of lines) {
    const h2 = line.match(/^## (.+)$/);
    if (h2) {
      flush();
      const heading = h2[1].trim();
      const match = flat.find((s) => s.label.toLowerCase() === heading.toLowerCase());
      current = { label: match?.label ?? heading, lines: [] };
      continue;
    }
    if (current) current.lines.push(line);
  }
  flush();

  const usedLabels = new Set(chunks.map((c) => c.label));
  for (const s of flat) {
    if (!usedLabels.has(s.label)) chunks.push({ label: s.label, body: "" });
  }

  const sections: JSONContent[] = chunks.map((chunk) => {
    let content: JSONContent[];
    if (chunk.body) {
      const html = markdownToHtml(chunk.body);
      const parsed = generateJSON(html, innerExtensions);
      content = parsed.content?.length ? parsed.content : [{ type: "paragraph" }];
    } else {
      content = [{ type: "paragraph" }];
    }
    return { type: "section", attrs: { label: chunk.label }, content };
  });

  return { type: "doc", content: sections };
};

const markdownToHtml = (md: string): string => {
  return md
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      const listLines = trimmed.split("\n").filter((l) => /^[-*] /.test(l));
      if (listLines.length === trimmed.split("\n").filter(Boolean).length && listLines.length > 0) {
        const items = listLines.map((l) => `<li><p>${escapeHtml(l.replace(/^[-*] /, ""))}</p></li>`);
        return `<ul>${items.join("")}</ul>`;
      }
      return `<p>${escapeHtml(trimmed)}</p>`;
    })
    .join("");
};

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
