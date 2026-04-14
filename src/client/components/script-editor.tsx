import { useMemo, useRef, useCallback } from "react";
import { EditorProvider, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { SectionNode } from "../editor/section-node.tsx";
import { EditorToolbar } from "../editor/toolbar.tsx";
import type { TemplateSection } from "../../server/domains/templates/schema.ts";

type Props = {
  sections: TemplateSection[];
  content: JSONContent | null;
  onSave: (doc: JSONContent) => void;
};

const flattenSections = (sections: TemplateSection[]): { key: string; label: string }[] =>
  sections.flatMap((s) =>
    s.children?.length
      ? s.children.map((c) => ({ key: c.key, label: `${s.label} — ${c.label}` }))
      : [{ key: s.key, label: s.label }],
  );

const emptySectionDoc = (flat: { key: string; label: string }[]): JSONContent => ({
  type: "doc",
  content: flat.map((s) => ({
    type: "section",
    attrs: { label: s.label },
    content: [{ type: "paragraph" }],
  })),
});

const extensions = [StarterKit, SectionNode];

export const ScriptEditor = ({ sections: templateSections, content, onSave }: Props) => {
  const flat = useMemo(() => flattenSections(templateSections), [templateSections]);
  const initialDoc = content ?? emptySectionDoc(flat);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleUpdate = useCallback(
    ({ editor }: { editor: any }) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => onSave(editor.getJSON()), 500);
    },
    [onSave],
  );

  return (
    <EditorProvider
      extensions={extensions}
      content={initialDoc}
      onUpdate={handleUpdate}
      slotBefore={<EditorToolbar />}
    />
  );
};
