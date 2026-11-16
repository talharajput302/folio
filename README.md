# Folio

A lightweight collaborative document editor inspired by Google Docs — create,
format, upload-into, and share rich-text documents, with real accounts, per-user
access control, and persistence.

> Built as a timeboxed (4–6h) product slice. See `docs/PRD.md` for scope,
> `docs/ARCHITECTURE.md` for design, `docs/DECISIONS.md` for tradeoffs, and
> `SECURITY.md` for the threat model.

## Features

- **Accounts** — sign up / sign in with email + password (bcrypt-hashed), live
  password-strength checklist, show/hide password.
- **Rich-text editing** — bold, italic, underline, headings (H1–H3), bullet &
  numbered lists, with autosave.
- **Documents** — create, rename, edit, delete; title placeholder until named.
- **Import** — upload a `.txt` or `.md` file (≤1 MB) → a new editable document.
- **Sharing** — share a document with another user by email; clear **Documents
  you own** vs **Shared with you** split; shared users can edit, only the owner
  can delete/share.
- **Persistence** — SQLite via Prisma; survives refresh, formatting preserved.
- **Access control** — enforced server-side on every request (outsiders get 404).

## Tech stack

Next.js (App Router) · TypeScript · TipTap · Prisma + SQLite · Zod ·
isomorphic-dompurify · bcryptjs · Tailwind CSS · Vitest.
UI accents via [React Bits](https://reactbits.dev) (ShinyText, ClickSpark —
zero-dependency). Package manager: **pnpm**.

## Prerequisites

- Node.js 18+ and **pnpm** (`npm i -g pnpm`)
- A PostgreSQL database URL. The easiest free option is **Neon**
  (neon.tech) — create a project and copy its connection string. No local
  database software needed.

## Setup & run (local)

```bash
pnpm install
cp .env.example .env           # then paste your Neon DATABASE_URL + a SESSION_SECRET
pnpm prisma db push            # creates the tables on your database
pnpm dev                       # http://localhost:3000
```

Generate a session secret with `openssl rand -hex 32`.

There are **no seeded accounts** — create your own via **Sign up**. Passwords must
be 8+ characters with an uppercase, a lowercase, and a number.

### Testing the sharing flow

Sharing needs two accounts. Use a normal window and an incognito window:

1. Window A: sign up as e.g. `alice@demo.com`, create a document, click **Share**,
   enter the second user's email.
2. Window B (incognito): sign up as that second email → the document appears under
   **Shared with you**.
3. A third account cannot open the document URL (returns 404).

## Supported upload types

`.txt` and `.md` only, up to 1 MB. Other types are rejected with a clear message.

## Tests

```bash
pnpm test     # Vitest: access control, XSS sanitization, upload + list behaviour
```

## Scripts

- `pnpm dev` — run locally
- `pnpm build` / `pnpm start` — production build
- `pnpm test` — run Vitest
- `pnpm db:reset` — reset the local database
- `pnpm prisma studio` — inspect the DB

## Deployment

App → Vercel, DB → Neon Postgres (switch the Prisma provider to `postgresql` and
set `DATABASE_URL`). See `docs/ARCHITECTURE.md` → Deployment. Live URL in
`SUBMISSION.md`.
