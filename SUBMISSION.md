# Submission — Folio

A lightweight collaborative document editor (Google Docs–inspired slice): create,
format, upload-into, and share rich-text documents, with per-user access control
and persistence.

## Links

- **Source (GitHub):** https://github.com/talharajput302/folio
- **Walkthrough video:** _<add unlisted Loom/YouTube link>_
- **Live app:** not deployed — please run locally (steps below). The app is
  deploy-ready (one Next.js app; swap the Prisma provider to Postgres for a
  hosted DB). This was the deliberate cut under the timebox.

## Accounts (for reviewers)

There are **no pre-made accounts** — each reviewer signs up with their own email
and a password (8+ chars, with an uppercase, a lowercase, and a number). Creating
an account live is part of the walkthrough.

**To test sharing** you need two accounts, so use a normal window and an
incognito window:

1. Window A: sign up (any email), create a document → **Share** → enter the
   second account's email.
2. Window B (incognito): sign up with that second email → the document shows under
   **Shared with you** and is editable.
3. A third account cannot open the document's URL — it returns **404**.

## Run locally

```bash
pnpm install
cp .env.example .env
pnpm prisma migrate dev     # creates the SQLite schema
pnpm dev                    # http://localhost:3000  (sign up to start)
pnpm test                   # run the test suite
```

Prereqs: Node 18+ and pnpm (`npm i -g pnpm`).

## What works (end-to-end, verified)

- Create / rename / edit / delete documents; **autosave** + explicit save.
- Rich text: bold, italic, underline, H1–H3, bullet & numbered lists.
- Persistence via SQLite/Prisma — survives refresh; formatting preserved.
- **File upload**: `.txt` / `.md` (≤1 MB) → a new editable document. Other types
  rejected with a clear message.
- **Sharing**: owner grants access by email; **Owned** vs **Shared with me**
  sections; shared users can edit; only the owner can delete/share.
- **Accounts**: email + password sign up / sign in, bcrypt-hashed, live
  password-strength checklist, show/hide password.
- **Access control** enforced server-side on every request — verified:
  outsider → 404, editor delete → 403, anonymous → 401.
- **Security**: Prisma (no SQL injection), DOMPurify (stored-XSS stripped —
  verified), Zod validation, safe error envelope, secrets in env.
- **Tests**: 24 passing Vitest tests (access control, sanitization, upload +
  list behaviour).

## What is intentionally partial / deferred (and why)

- **Live deployment** — app is fully working locally; deploy to Vercel + Neon is a
  guided follow-up step (no paid dependency). _Update link above once deployed._
- **Login hardening** — rate limiting / brute-force protection and CSRF tokens not
  yet added (sameSite cookies in place). First production add.
- **Email verification / password reset / OAuth** — out of scope for this slice.
- **Real-time multi-cursor collaboration** — out of scope.
- **`.docx` import** — only `.txt`/`.md` supported (stated in UI).
- **Comments / version history / roles beyond owner+editor** — stretch, not built.
- **Mixed list types within one list** — each line is an independent list item;
  bulleted and numbered lists live as separate lists (as in Google Docs).

## What I'd do with another 2–4 hours

1. Deploy live (Vercel + Neon) and smoke-test the hosted build.
2. Rate limiting + CSRF on mutations; email verification / password reset.
3. Viewer (read-only) role and a document version-history trail.
4. Light markdown parsing on import (headings/bold) instead of text-only.

## AI workflow (summary)

Built with Claude (Claude Code). AI accelerated scaffolding, Prisma schema, API
handlers, TipTap wiring, tests, and docs. I kept judgment: tightened access
control to return 404 (not 403) to avoid leaking existence, locked the DOMPurify
allow-list to our formatting set, pinned trusted package versions, and verified
everything by driving the real multi-user flow + curl security probes. Full note:
`docs/AI_WORKFLOW.md`.

## Architecture (summary)

Single Next.js (App Router) app — UI + API in one deployable. TipTap editor stores
sanitized HTML. Prisma + SQLite (swappable to Postgres). One access-control
chokepoint (`src/lib/access.ts`) guards every document read/write. Full note:
`docs/ARCHITECTURE.md`; tradeoffs in `docs/DECISIONS.md`.
