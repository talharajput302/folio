import { describe, it, expect } from "vitest";
import { validateUpload, textToHtml, titleFromFilename, escapeHtml } from "./import";

describe("validateUpload", () => {
  it("accepts a .txt within the size limit", () => {
    expect(validateUpload("notes.txt", 500)).toEqual({ ok: true, ext: ".txt" });
  });

  it("accepts a .md within the size limit", () => {
    expect(validateUpload("README.md", 500)).toEqual({ ok: true, ext: ".md" });
  });

  it("rejects an unsupported extension", () => {
    const r = validateUpload("resume.pdf", 500);
    expect(r.ok).toBe(false);
  });

  it("rejects a file over 1 MB", () => {
    const r = validateUpload("big.txt", 2_000_000);
    expect(r.ok).toBe(false);
  });

  it("rejects an empty file", () => {
    const r = validateUpload("empty.txt", 0);
    expect(r.ok).toBe(false);
  });
});

describe("textToHtml", () => {
  it("splits blank-line separated blocks into paragraphs", () => {
    expect(textToHtml("one\n\ntwo")).toBe("<p>one</p><p>two</p>");
  });

  it("converts single newlines to line breaks", () => {
    expect(textToHtml("a\nb")).toBe("<p>a<br>b</p>");
  });

  it("escapes HTML so uploaded content cannot inject markup", () => {
    expect(textToHtml("<script>alert(1)</script>")).toBe(
      "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>",
    );
  });

  it("returns an empty paragraph for empty input", () => {
    expect(textToHtml("   ")).toBe("<p></p>");
  });
});

describe("titleFromFilename", () => {
  it("strips the extension", () => {
    expect(titleFromFilename("Meeting Notes.md")).toBe("Meeting Notes");
  });

  it("strips a path", () => {
    expect(titleFromFilename("C:/docs/plan.txt")).toBe("plan");
  });
});

describe("escapeHtml", () => {
  it("escapes angle brackets and ampersands", () => {
    expect(escapeHtml("a & <b>")).toBe("a &amp; &lt;b&gt;");
  });
});
