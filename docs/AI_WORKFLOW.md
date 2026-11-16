# AI-Native Workflow Note

How AI was actually used to build Folio. We care about *practical* AI use, not
volume.

## Tools used

- **Claude (Claude Code / Opus)** — primary pair-engineer: project scaffolding,
  Prisma schema, Next.js API route handlers, auth, TipTap editor wiring, the UI
  redesign, tests, and all planning/architecture docs.
- **React Bits (reactbits.dev)** — source for two vendored UI components
  (ShinyText, ClickSpark), chosen for being zero-dependency.

## Where AI materially sped things up

- Generating the Prisma schema + the access-control chokepoint from a
  plain-English spec.
- Consistent API handlers: `requireUser` → Zod validate → access check → Prisma,
  with a shared safe error envelope.
- TipTap toolbar wiring (commands, active states) and the editor UX.
- Drafting the Vitest suite (access matrix, XSS sanitization, upload + list
  behaviour).
- Writing the planning/architecture/security docs quickly and consistently.

## What AI output I changed or rejected

- **Auth: rejected the first approach.** AI initially shipped a lightweight
  passwordless "pick a seeded user" login to save time. It read as a toy, so we
  replaced it with real email + password auth (bcrypt) and signup — and removed
  the seeded accounts entirely.
- **Access control hardened.** Changed "not allowed" responses from 403 to **404**
  so the API never reveals that a document exists (IDOR defense).
- **Sanitizer tightened.** Locked DOMPurify to our exact formatting tags and
  disallowed URIs, rather than a broad default allow-list.
- **List bug: stopped guessing, measured instead.** A per-line list-conversion bug
  resisted several blind fixes (each made it worse). Instead of guessing, we wrote
  a **headless jsdom test** that ran the editor's ProseMirror commands and printed
  the resulting HTML — which revealed the real cause (a paragraph nesting inside a
  list item). The fix was a schema change (single-paragraph list items), then
  verified by that test. AI's first "smart" fix was discarded for being fragile.
- **Dependency hygiene.** Kept to well-known, correctly-spelled, version-pinned
  packages; avoided heavier animated-background components that would pull in
  WebGL/GSAP dependencies.

## How correctness, UX, and reliability were verified

- **Correctness/security:** curl probes of the real multi-user flow — signup,
  login (wrong password → 401, duplicate → 409), share, and access control
  (outsider → 404, editor delete → 403, anonymous → 401). XSS payloads pasted into
  a document and confirmed stripped on read.
- **Editor behaviour:** headless jsdom tests asserting the exact HTML produced by
  list commands.
- **UX:** walked the real create → format → save → reopen → import → share flow in
  the browser, fixing issues found (autosave race on "Back", date hydration
  mismatch, native confirm dialog, password UX).
- **Build:** TypeScript strict typecheck + `next build` green; 24 Vitest tests
  passing.
