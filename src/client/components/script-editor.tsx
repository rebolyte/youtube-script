import { useEffect, useRef, useMemo } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { SectionNode } from "../editor/section-node.tsx";
import { Toolbar } from "../editor/toolbar.tsx";
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

export const ScriptEditor = ({ sections: templateSections, content, onSave }: Props) => {
  const flat = useMemo(() => flattenSections(templateSections), [templateSections]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastContentRef = useRef<JSONContent | null>(null);

  const initialDoc = content ?? emptySectionDoc(flat);

  const editor = useEditor({
    extensions: [StarterKit, SectionNode],
    content: initialDoc,
    onUpdate: ({ editor }) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const json = editor.getJSON();
        lastContentRef.current = json;
        onSave(json);
      }, 500);
    },
  });

  useEffect(() => {
    if (!editor || !content || content === lastContentRef.current) return;
    lastContentRef.current = content;
    editor.commands.setContent(content);
  }, [content, editor]);

  return (
    <>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </>
  );
};
