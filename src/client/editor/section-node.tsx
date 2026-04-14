import { useState } from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
  type ReactNodeViewProps,
} from "@tiptap/react";
import { GripVertical, ChevronDown } from "lucide-react";

const SectionView = ({ node }: ReactNodeViewProps) => {
  const [expanded, setExpanded] = useState(true);

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
          <span className="text-xs font-medium text-neutral-900 tracking-wide uppercase flex items-center">
            {node.attrs.label as string}
          </span>
          <button
            type="button"
            style={{ all: "unset", cursor: "pointer", display: "flex", marginLeft: "auto" }}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
            onClick={() => setExpanded((v) => !v)}
            onMouseDown={(e) => e.preventDefault()}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
        {expanded && (
          <>
            <div className="h-px bg-neutral-200" />
            <NodeViewContent className="px-6 py-3 text-sm" />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const SectionNode = Node.create({
  name: "section",
  group: "section",
  content: "block+",
  draggable: true,
  isolating: true,
  defining: true,

  addAttributes() {
    return {
      label: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="section"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "section" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SectionView);
  },
});
