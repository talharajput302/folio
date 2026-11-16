import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "./sanitize";

// Stored-XSS defense: malicious markup must be stripped, legitimate formatting
// must be preserved.
describe("sanitizeHtml", () => {
  it("removes <script> tags", () => {
    const out = sanitizeHtml("<p>hi</p><script>alert(1)</script>");
    expect(out).not.toContain("<script");
    expect(out).toContain("<p>hi</p>");
  });

  it("strips event-handler attributes like onerror", () => {
    const out = sanitizeHtml('<img src=x onerror="alert(1)">');
    expect(out).not.toContain("onerror");
    expect(out).not.toContain("<img");
  });

  it("removes iframes", () => {
    const out = sanitizeHtml('<iframe src="evil"></iframe>');
    expect(out).not.toContain("<iframe");
  });

  it("preserves allowed formatting (bold, headings, lists)", () => {
    const input =
      "<h2>Title</h2><p><strong>bold</strong> <em>italic</em></p><ul><li>a</li></ul>";
    const out = sanitizeHtml(input);
    expect(out).toContain("<h2>Title</h2>");
    expect(out).toContain("<strong>bold</strong>");
    expect(out).toContain("<em>italic</em>");
    expect(out).toContain("<li>a</li>");
  });
});
