import { useEffect, useRef } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Toolbar } from "../editor/toolbar.tsx";

type Props = {
  initialContent: JSONContent | null;
  onSave: (doc: JSONContent) => void;
};

export const BraindumpEditor = ({ initialContent, onSave }: Props) => {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hydrated = useRef(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent ?? { type: "doc", content: [{ type: "paragraph" }] },
    onUpdate: ({ editor }) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => onSave(editor.getJSON()), 500);
    },
  });

  useEffect(() => {
    if (!editor || hydrated.current || !initialContent) return;
    hydrated.current = true;
    editor.commands.setContent(initialContent);
  }, [initialContent, editor]);

  return (
    <>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </>
  );
};
