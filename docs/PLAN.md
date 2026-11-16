# Implementation Plan — Folio

Milestone-based build order. Each milestone is independently demoable. We build
depth-first through the core, then hardening, then docs, then deploy.

## M0 — Foundation
- Scaffold Next.js (App Router, TS, Tailwind) with pnpm.
- Install trusted deps (TipTap, Prisma, Zod, isomorphic-dompurify, Vitest).
- `.gitignore`, env setup, Prisma init with SQLite.

## M1 — Data + auth
- Prisma schema: User, Document, Share. Migrate.
- Real auth: email + password signup/login (bcrypt), session cookie.
- `src/lib`: db, auth (session cookie), access control, schemas, sanitize.
- Login page + logout.

## M2 — Documents (the heart)
- API: create / list / get / update / rename / delete documents.
- Dashboard: "Owned" vs "Shared with me" sections.
- Editor page: TipTap toolbar (bold, italic, underline, headings, lists),
  autosave + save state, rename inline.

## M3 — Sharing
- API: share (owner only, by email) / unshare / list collaborators.
- Share dialog in the editor; recipient sees doc under "Shared with me".
- Access control verified end-to-end (owner, editor, outsider→404).

## M4 — File upload
- API: upload `.txt`/`.md` (≤1 MB) → new document with imported content.
- Upload UI with stated supported types + validation errors.

## M5 — Hardening
- Zod on every endpoint, DOMPurify on save/render, safe error envelope.
- Loading/empty/error states in UI.

## M6 — Tests
- Vitest: access-control unit tests (owner/editor/outsider), share logic,
  upload validation.

## M7 — Docs & submission
- README (setup/run), finalize ARCHITECTURE, AI_WORKFLOW, SECURITY, SUBMISSION.md.
- Demo GIF/screenshots.

## M8 — Deploy (Phase 2, guided)
- GitHub → Vercel → Neon Postgres. Migrate. Verify live.

## Time budget (target, 4–6h)
M0 15m · M1 45m · M2 90m · M3 45m · M4 30m · M5 30m · M6 30m · M7 30m · M8 30m.
If over budget: cut to viewer-role stretch and keep core solid.
