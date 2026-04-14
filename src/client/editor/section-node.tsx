import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from "@tiptap/react";

const SectionView = ({ node }: ReactNodeViewProps) => (
  <NodeViewWrapper className="script-section">
    <div className="script-section-header" data-drag-handle="">
      <span className="script-section-drag">⠿</span>
      {node.attrs.label as string}
    </div>
    <NodeViewContent className="script-section-body" />
  </NodeViewWrapper>
);

export const SectionNode = Node.create({
  name: "section",
  group: "block",
  content: "block+",
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      label: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="section"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "section" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SectionView);
  },
});
