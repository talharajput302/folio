# Folio — Submission

Folio is a lightweight, collaborative document editor — a focused, Google-Docs-inspired slice: sign up, write and format rich-text documents, import text files, and share documents with specific people, backed by real accounts, server-enforced access control, and persistence.

## Links
- **Source (GitHub):** https://github.com/talharajput302/folio
- **Walkthrough video:** see the video link field of this submission form.
- **Live URL:** not hosted — the app runs locally in ~2 minutes (steps below). See *Deliberate scope cuts* for the reasoning.

## Features
- Email + password accounts (bcrypt-hashed) with a live password-strength checklist and show/hide.
- Rich-text editing: bold, italic, underline, H1–H3, bulleted & numbered lists, with autosave.
- Create / rename / edit / delete documents.
- Import a `.txt` or `.md` file (≤1 MB) into a new editable document.
- Sharing by email, with a clear **Documents you own** vs **Shared with you** split; shared users can edit, only the owner can delete or re-share.
- Persistence (Prisma + SQLite); formatting preserved across refresh.

## Run locally (~2 minutes)
Requires Node 18+ and pnpm (`npm i -g pnpm`). No database software to install.

```
pnpm install
cp .env.example .env
pnpm prisma db push
pnpm dev            # http://localhost:3000
pnpm test           # 24 passing tests
```

## Accounts & testing the sharing flow
There are no seeded accounts — sign up with any email (password: 8+ characters with an uppercase, a lowercase and a number). To test sharing, use a normal window and an incognito window:

1. Window A: sign up, create a document → **Share** → enter the second account's email.
2. Window B (incognito): sign up with that email → the document appears under **Shared with you** and is editable.
3. A third, unrelated account that opens the document's URL gets a **404**.

## What works (end-to-end, verified)
Every feature above works end-to-end, and security was verified rather than assumed:

- **Access control** is enforced on every request — outsider → 404, shared editor attempting delete → 403, anonymous → 401.
- **No SQL injection** — all database access goes through Prisma (parameterized queries); no raw SQL.
- **Stored-XSS stripped** — rich text is sanitized (DOMPurify); verified by pasting `<script>` and `<img onerror>` payloads and confirming they are removed.
- **Passwords** are bcrypt-hashed; login returns a single generic error for wrong email or password (no account enumeration).
- **24 automated tests** (Vitest) cover the access-control matrix, sanitization, upload validation, and editor list behaviour.

## Deliberate scope cuts (and why)
- **Hosting.** I prioritised a fully working, well-tested local build over a rushed hosted one. The app is deploy-ready — it's a single Next.js app, so going live is a Prisma provider swap (SQLite → Postgres) plus two environment variables. Given the timebox, correctness, security and a clean codebase were a higher-value use of the remaining time than an under-tested live URL.
- **Real-time multi-cursor collaboration, comments, version history, `.docx` import, and roles beyond owner/editor** are out of scope for this slice — sharing with per-user access was the core to prove.
- **Mixing list types inside a single list** — each line is an independent list item; bulleted and numbered lists live as separate lists, exactly how Google Docs treats them.

## Notable engineering decisions & challenges
- **Rich-text list semantics.** Per-line list conversion behaved unexpectedly because ProseMirror permits multi-paragraph list items. Instead of patching the UI by trial and error, I wrote headless tests that ran the editor's commands and inspected the resulting document, isolated the root cause, and fixed it at the schema level (single-paragraph list items). Measured, not guessed.
- **Access-control model.** Unauthorized access returns 404 rather than 403, so the API never reveals whether a document exists (an IDOR defense); the full owner/editor/outsider/anonymous matrix is tested.
- **Supply-chain hygiene.** pnpm blocks dependency install-scripts by default; I kept that safeguard, used only well-known, version-pinned packages, and generated the Prisma client explicitly rather than disabling the protection.
- **Auth iteration.** I began with a lightweight login to move quickly, then deliberately upgraded to real email + password (bcrypt) with signup, because the lightweight version read as a prototype rather than a product.
- **SSR correctness.** Resolved a hydration mismatch caused by locale-dependent timestamps by rendering dates on the client.

## With another 2–4 hours
1. Host it live (Vercel + a managed Postgres such as Neon) and smoke-test the deployed build.
2. Login hardening — rate limiting / brute-force protection and CSRF tokens; plus email verification and password reset.
3. A viewer (read-only) role and a document version-history trail.
4. Richer import — parse markdown headings/bold on import instead of importing as plain text.

## AI workflow
Built with Claude (Claude Code) as a pair-engineer for scaffolding, the Prisma schema, API handlers, the editor, tests, and the written docs. I kept judgment where it mattered: I rejected the first passwordless-auth approach in favour of real auth, tightened unauthorized responses to 404, locked the HTML sanitizer to an explicit allow-list, and — when a UI bug resisted quick fixes — stopped guessing and wrote headless tests to find the true cause. Correctness was verified with the test suite plus manual multi-user testing and curl-based security probes.

## Architecture (summary)
A single Next.js (App Router) application — UI and API in one deployable. TipTap editor; content stored as sanitized HTML. Prisma ORM over SQLite (swappable to Postgres). A single access-control chokepoint guards every document read and write. Zod validates every API input, and errors return a safe envelope with no internal details exposed.
