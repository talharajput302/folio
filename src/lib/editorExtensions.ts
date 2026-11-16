import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import ListItem from "@tiptap/extension-list-item";

// Restrict every list item to a single paragraph (no nested paragraphs or
// sub-lists). This keeps each line an independent list item — Word-like — and
// prevents a paragraph from being nested inside a list item, which previously
// made toggling a list type affect the whole list instead of one line.
const FlatListItem = ListItem.extend({ content: "paragraph" });

export function editorExtensions(placeholder = "Start writing…") {
  return [
    StarterKit.configure({ listItem: false }),
    FlatListItem,
    Underline,
    Placeholder.configure({ placeholder }),
  ];
}
