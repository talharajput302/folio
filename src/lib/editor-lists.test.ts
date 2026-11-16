// @vitest-environment jsdom
// Verifies list behaviour with our editor extensions (single-paragraph list
// items), so each line stays an independent list item.
import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/react";
import { editorExtensions } from "./editorExtensions";

function makeEditor(content: string) {
  const element = document.createElement("div");
  document.body.appendChild(element);
  return new Editor({ element, extensions: editorExtensions(), content });
}

describe("editor list commands", () => {
  it("turns a paragraph into a bulleted list", () => {
    const editor = makeEditor("<p>hello</p>");
    editor.chain().focus().toggleBulletList().run();
    expect(editor.getHTML()).toBe("<ul><li><p>hello</p></li></ul>");
  });

  it("turns a paragraph into a numbered list", () => {
    const editor = makeEditor("<p>hello</p>");
    editor.chain().focus().toggleOrderedList().run();
    expect(editor.getHTML()).toBe("<ol><li><p>hello</p></li></ol>");
  });

  it("does NOT allow a nested paragraph inside a list item (stays one line each)", () => {
    // Even if given a nested structure, the schema keeps list items to a single
    // paragraph, so the second paragraph is lifted out instead of nesting.
    const editor = makeEditor("<ul><li><p>world</p><p>hello</p></li></ul>");
    expect(editor.getHTML()).not.toContain("<p>world</p><p>hello</p>");
  });

  it("converts only the current line when it is a separate list/paragraph", () => {
    const editor = makeEditor("<ul><li><p>world</p></li></ul><p>hello</p>");
    editor.chain().focus("end").run(); // cursor in the standalone 'hello'
    editor.chain().focus().toggleOrderedList().run();
    expect(editor.getHTML()).toBe(
      "<ul><li><p>world</p></li></ul><ol><li><p>hello</p></li></ol>",
    );
  });
});
