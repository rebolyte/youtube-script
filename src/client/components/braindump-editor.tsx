import { useEffect, useRef, useCallback } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

type Props = {
  initialContent: string;
  onSave: (text: string) => void;
};

export const BraindumpEditor = ({ initialContent, onSave }: Props) => {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hydrated = useRef(false);

  const editor = useCreateBlockNote({});

  useEffect(() => {
    if (hydrated.current || !initialContent) return;
    hydrated.current = true;
    void (async () => {
      const blocks = await editor.tryParseMarkdownToBlocks(initialContent);
      editor.replaceBlocks(editor.document, blocks);
    })();
  }, [initialContent, editor]);

  const handleChange = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const markdown = editor.blocksToMarkdownLossy(editor.document);
      onSave(markdown);
    }, 500);
  }, [editor, onSave]);

  return (
    <BlockNoteView
      editor={editor}
      onChange={handleChange}
      theme="light"
    />
  );
};
