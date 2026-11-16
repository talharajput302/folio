# CLAUDE.md — Project Working Guide

Single source of truth for how we build **Folio**, a lightweight
collaborative document editor. Read `docs/PRD.md`, `docs/ARCHITECTURE.md`, and
`SECURITY.md` before changing code. Track progress in `CHECKLIST.md`.

## What this project is

A small, focused full-stack slice inspired by Google Docs: create / edit / rename
rich-text documents, upload a file into a document, and share a document with
another user — all persisted and access-controlled.

This is a **timeboxed product slice (4–6 hours)**, not a Google Docs clone. Depth
in a few areas beats shallow coverage everywhere. Every scope cut is deliberate and
recorded in `docs/DECISIONS.md`.

## Tech stack (locked)

- **Package manager:** pnpm (never npm/yarn in this repo)
- **Framework:** Next.js (App Router) + TypeScript — frontend + backend in one app
- **Editor:** TipTap (ProseMirror) — official packages only
- **DB / ORM:** SQLite (local) via Prisma; swappable to Postgres for deploy
- **Auth:** email + password, bcryptjs-hashed, signed httpOnly session cookie
- **Validation:** Zod on every API boundary
- **Sanitization:** isomorphic-dompurify for stored/rendered HTML
- **Styling:** Tailwind CSS; UI accents from React Bits (ShinyText, ClickSpark)
- **Tests:** Vitest

List items use a single-paragraph schema (`@tiptap/extension-list-item`) so each
line stays an independent list item.

## Non-negotiable engineering rules

1. **Dependency hygiene.** Only well-known, correctly-spelled packages. Verify the
   exact name before adding. No obscure packages. Guards against typosquatting /
   supply-chain attacks.
2. **No raw SQL.** All DB access via Prisma (parameterized) — kills SQL injection.
3. **Access control on every request.** Never trust a document ID from the client.
   Every read/write re-checks owner-or-shared; otherwise 404 (don't leak existence).
4. **Validate all input** with Zod before it touches the DB.
5. **Sanitize rich text** before persisting/rendering to prevent stored XSS.
6. **Secrets in env vars**, never in code or git. `.env` is gitignored.
7. **Errors are safe.** Friendly message to user; no stack traces to the client.
8. **Fail loudly in dev, gracefully in prod.**

## Definition of done (per feature)

- Works end-to-end in the browser.
- Input validated, errors handled.
- Access-control checked where relevant.
- Covered by / compatible with the test suite.
- Docs updated if architecture changed.

## Folder conventions

- `src/app/` — routes (pages + API route handlers)
- `src/lib/` — server logic (db, auth, schemas, sanitize)
- `src/components/` — client UI
- Keep API handlers thin; logic lives in `src/lib/`.
