import { Node, mergeAttributes } from "@tiptap/core";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  type ReactNodeViewProps,
} from "@tiptap/react";
import { GripVertical, Trash2 } from "lucide-react";

const TemplateSectionView = ({ node, editor, getPos }: ReactNodeViewProps) => {
  const label = (node.attrs.label as string) || "";

  return (
    <NodeViewWrapper className="group relative my-3">
      <div className="relative overflow-hidden rounded-lg bg-white border border-neutral-200 transition-all duration-200 hover:border-neutral-300 hover:shadow-sm">
        <div
          className="flex items-center gap-3 px-3 py-2"
          contentEditable={false}
          data-drag-handle=""
        >
          <span className="cursor-grab transition-all duration-200 text-neutral-400 hover:text-neutral-600 active:cursor-grabbing flex items-center">
            <GripVertical className="h-4 w-4" />
          </span>
          <input
            type="text"
            className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-200 focus:bg-white focus:ring-1 focus:ring-neutral-200"
            value={label}
            onChange={(e) => {
              const pos = getPos();
              if (typeof pos !== "number") return;
              editor.chain().command(({ tr, state }) => {
                const n = state.doc.nodeAt(pos);
                if (!n) return false;
                tr.setNodeMarkup(pos, undefined, { ...n.attrs, label: e.target.value });
                return true;
              }).run();
            }}
            placeholder="Section name"
          />
          <button
            type="button"
            style={{ all: "unset", cursor: "pointer", display: "flex", marginLeft: "auto" }}
            className="text-neutral-400 transition-colors hover:text-red-600"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const pos = getPos();
              if (typeof pos !== "number") return;
              editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const TemplateSectionNode = Node.create({
  name: "templateSection",
  group: "block",
  content: "",
  draggable: true,
  isolating: true,
  defining: true,

  addAttributes() {
    return {
      key: { default: "" },
      label: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="template-section"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "template-section",
        "data-key": node.attrs.key as string,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TemplateSectionView);
  },
});
