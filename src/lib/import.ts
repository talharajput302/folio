import { UPLOAD } from "./schemas";

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Converts uploaded plain-text / markdown content into simple, safe HTML the
// editor can open. We import as text (paragraphs + line breaks) rather than
// parsing markdown — a deliberate scope choice (see DECISIONS.md). Output is
// still passed through the sanitizer by the caller.
export function textToHtml(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = normalized.split(/\n{2,}/);
  const html = blocks
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
  return html || "<p></p>";
}

// Validates an uploaded file's name + size. Pure, so it is unit tested directly.
export function validateUpload(
  filename: string,
  byteLength: number,
): { ok: true; ext: string } | { ok: false; error: string } {
  const lower = filename.toLowerCase();
  const ext = lower.slice(lower.lastIndexOf("."));
  if (!UPLOAD.allowedExtensions.includes(ext as (typeof UPLOAD.allowedExtensions)[number])) {
    return {
      ok: false,
      error: `Unsupported file type. Allowed: ${UPLOAD.allowedExtensions.join(", ")}`,
    };
  }
  if (byteLength > UPLOAD.maxBytes) {
    return { ok: false, error: "File too large (max 1 MB)." };
  }
  if (byteLength === 0) {
    return { ok: false, error: "File is empty." };
  }
  return { ok: true, ext };
}

// Derives a document title from a filename (strips path + extension).
export function titleFromFilename(filename: string): string {
  const base = filename.split(/[\\/]/).pop() || filename;
  const dot = base.lastIndexOf(".");
  const name = dot > 0 ? base.slice(0, dot) : base;
  return name.trim().slice(0, 200) || "Untitled";
}
