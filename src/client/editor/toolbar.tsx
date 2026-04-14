import type { Editor } from "@tiptap/react";

type Props = { editor: Editor | null };

export const Toolbar = ({ editor }: Props) => {
  if (!editor) return null;

  const btn = (active: boolean) =>
    `toolbar-btn${active ? " toolbar-btn-active" : ""}`;

  return (
    <div className="toolbar">
      <button
        className={btn(editor.isActive("bold"))}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        B
      </button>
      <button
        className={btn(editor.isActive("italic"))}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        I
      </button>
      <button
        className={btn(editor.isActive("strike"))}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        S
      </button>
      <span className="toolbar-sep" />
      <button
        className={btn(editor.isActive("bulletList"))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        List
      </button>
      <button
        className={btn(editor.isActive("orderedList"))}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1.
      </button>
      <button
        className={btn(editor.isActive("blockquote"))}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        Quote
      </button>
    </div>
  );
};
