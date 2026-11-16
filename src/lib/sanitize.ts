import DOMPurify from "isomorphic-dompurify";

// Allow only the formatting our editor produces. Everything else (scripts,
// iframes, event-handler attributes, styles, links/images) is stripped. This is
// the stored-XSS defense: untrusted HTML is cleaned before it is persisted AND
// before it is rendered.
const ALLOWED_TAGS = [
  "p", "br",
  "strong", "b", "em", "i", "u", "s",
  "h1", "h2", "h3",
  "ul", "ol", "li",
  "blockquote", "code", "pre",
];

const ALLOWED_ATTR: string[] = []; // no attributes needed for our formatting set

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^$/, // no URIs permitted
  });
}
