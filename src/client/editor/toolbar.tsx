import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/components/tiptap-ui-primitive/toolbar";
import { MarkButton } from "@/components/tiptap-ui/mark-button/mark-button";
import { ListButton } from "@/components/tiptap-ui/list-button/list-button";
import { HeadingButton } from "@/components/tiptap-ui/heading-button/heading-button";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button/blockquote-button";

export const EditorToolbar = () => (
  <Toolbar>
    <ToolbarGroup>
      <MarkButton type="bold" />
      <MarkButton type="italic" />
      <MarkButton type="strike" />
    </ToolbarGroup>
    <ToolbarSeparator />
    <ToolbarGroup>
      <HeadingButton level={2} />
      <HeadingButton level={3} />
    </ToolbarGroup>
    <ToolbarSeparator />
    <ToolbarGroup>
      <ListButton type="bulletList" />
      <ListButton type="orderedList" />
      <BlockquoteButton />
    </ToolbarGroup>
  </Toolbar>
);
