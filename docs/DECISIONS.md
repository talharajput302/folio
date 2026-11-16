# Decisions & Tradeoffs (ADR log)

Short records of the meaningful choices and why. Reviewers care about judgment as
much as code.

## ADR-001: Next.js single app (not separate FE + BE)
**Choice:** One Next.js App-Router project hosting both UI and API routes.
**Why:** One deployable, one language, shared types, far less glue in a 4–6h box.
**Tradeoff:** Less separation than a dedicated API service; fine at this scale.

## ADR-002: SQLite + Prisma locally, Postgres for deploy
**Choice:** SQLite file for local dev; Prisma so the switch to Postgres is a
provider + URL change.
**Why:** Zero-setup local dev (no account), yet a clean deploy path.
**Tradeoff:** SQLite isn't suitable for serverless prod; mitigated by swap.

## ADR-003: Real email + password auth (no seeded accounts)
**Choice:** Sign up / sign in with email + password; passwords bcrypt-hashed; a
signed httpOnly session cookie carries the user id. No seeded accounts — users
create their own.
**Why:** An earlier iteration used seeded passwordless accounts to save time, but
it read as a toy. Real auth makes ownership and sharing credible and lets the
walkthrough demo account creation live. Still scoped: no email verification,
password reset, or OAuth.
**Tradeoff:** Reviewers must create two accounts to test sharing (documented).
Password reset / verification / OAuth are the first production adds.

## ADR-004: Store sanitized HTML (not ProseMirror JSON)
**Choice:** Persist the editor's HTML after DOMPurify sanitization.
**Why:** Lossless for our formatting set, trivial to render, no serialization
layer to maintain.
**Tradeoff:** JSON would be better for structured transforms/collab; not needed
for this slice.

## ADR-005: File upload limited to .txt / .md
**Choice:** Accept only `.txt` and `.md` (≤1 MB) → new editable document.
**Why:** Product-relevant (import existing notes) and robust; `.docx` parsing is a
rabbit hole with edge cases.
**Tradeoff:** No binary/Word import. Stated clearly in UI + README.

## ADR-006: Owner vs Editor only (no role matrix)
**Choice:** Two effective roles — owner (full) and editor (edit content).
**Why:** Demonstrates access control clearly without over-building permissions.
**Tradeoff:** No viewer/commenter roles; listed as a stretch.

## ADR-007: Autosave + explicit save
**Choice:** Debounced autosave while typing, plus a visible save state.
**Why:** Feels like a real editor; prevents lost work; cheap to implement.
**Tradeoff:** Slightly more client state; acceptable.

## ADR-008: React Bits for UI accents (zero-dependency only)
**Choice:** Use React Bits (reactbits.dev) copy-in components — **ShinyText**
(wordmark shimmer) and **ClickSpark** (auth-screen click feedback).
**Why:** Adds polish/brand feel. Both are pure-canvas with **no runtime
dependency** (no three.js / ogl / gsap), keeping the supply-chain surface small.
**Tradeoff:** Hand-vendored source we own; we skipped heavier animated
backgrounds that would pull in WebGL deps.

## ADR-009: Single-paragraph list items
**Choice:** Override `listItem` so each list item holds exactly one paragraph
(no nested paragraphs or sub-lists).
**Why:** ProseMirror's default allows multi-paragraph list items, which let a
line get nested inside another item — making a list-type toggle affect the whole
list. Restricting to one paragraph keeps every line an independent, Word-like
list item. Verified in `editor-lists.test.ts`.
**Tradeoff:** No nested/indented sub-lists — not offered in the toolbar anyway.

## ADR-010: Custom in-app confirm dialog (no native confirm)
**Choice:** A styled modal for destructive confirmation instead of
`window.confirm()`.
**Why:** The native dialog breaks the product's look; the modal matches the
design and is keyboard-dismissable.
