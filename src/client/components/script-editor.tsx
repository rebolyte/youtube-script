import { useEffect, useRef, useCallback } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import type { TemplateSection } from "../../server/domains/templates/schema.ts";

type Props = {
  sections: TemplateSection[];
  content: string;
  onSave: (text: string) => void;
};

export const ScriptEditor = ({ sections: _sections, content, onSave }: Props) => {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastContent = useRef("");

  const editor = useCreateBlockNote({});

  useEffect(() => {
    if (!content || content === lastContent.current) return;
    lastContent.current = content;
    void (async () => {
      const blocks = await editor.tryParseMarkdownToBlocks(content);
      editor.replaceBlocks(editor.document, blocks);
    })();
  }, [content, editor]);

  const handleChange = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const markdown = editor.blocksToMarkdownLossy(editor.document);
      lastContent.current = markdown;
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
