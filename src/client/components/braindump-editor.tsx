import { useRef, useCallback } from "react";
import { EditorProvider, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorToolbar } from "../editor/toolbar.tsx";

type Props = {
  initialContent: JSONContent | null;
  onSave: (doc: JSONContent) => void;
};

const extensions = [StarterKit];

export const BraindumpEditor = ({ initialContent, onSave }: Props) => {
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
      content={initialContent ?? { type: "doc", content: [{ type: "paragraph" }] }}
      onUpdate={handleUpdate}
      slotBefore={<EditorToolbar />}
    />
  );
};
