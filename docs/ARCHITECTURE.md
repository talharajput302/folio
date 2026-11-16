# Architecture — Folio

## Overview

A single **Next.js (App Router)** application. The frontend (React + TipTap) and
the backend (route handlers under `src/app/api`) live in one deployable. Data is
persisted in **SQLite via Prisma** locally, and can be pointed at Postgres for
deployment by changing one env var + the Prisma provider.

```
Browser (React + TipTap)
        │  fetch() JSON
        ▼
Next.js Route Handlers (/api/*)   ← Zod validation, auth, access control
        │  Prisma Client (parameterized)
        ▼
SQLite (dev)  /  Postgres (prod)
```

## Data model

```
User
  id           String  @id (cuid)
  email        String  @unique
  name         String
  passwordHash String              // bcrypt hash — never the plaintext
  documents    Document[]          // owned
  shares       Share[]             // docs shared TO this user

Document
  id        String  @id (cuid)
  title     String
  content   String            // sanitized HTML from TipTap
  ownerId   String  → User
  shares    Share[]
  createdAt DateTime
  updatedAt DateTime

Share
  id         String @id (cuid)
  documentId String → Document
  userId     String → User     // recipient
  role       String            // "editor" (only role for now)
  @@unique([documentId, userId])   // no duplicate shares
```

Access rule (enforced server-side on every request):
`canAccess(user, doc) = doc.ownerId === user.id OR a Share(doc, user) exists`.
Only the **owner** may rename-metadata... (rename allowed for editors too), delete,
and share. Editors may edit content. Non-members get **404** (existence hidden).

## Auth model

- Email + password sign up / sign in. Passwords are stored only as **bcrypt**
  hashes. A combined login page toggles between modes with a live
  password-strength checklist and show/hide.
- On success a signed **httpOnly session cookie** (HMAC over the user id) is set.
- `getCurrentUser()` reads + verifies the cookie server-side; API handlers reject
  when absent. No seeded accounts — users create their own. See docs/DECISIONS.md.

## Request lifecycle (example: open a document)

1. Client `GET /api/documents/:id`.
2. Handler resolves current user from cookie → 401 if none.
3. Validates `id` with Zod.
4. Prisma loads the doc + checks `canAccess` → 404 if not allowed.
5. Returns `{ id, title, content, role, owner }`.

## Key modules (src/lib)

- `db.ts` — Prisma client singleton.
- `auth.ts` — session cookie read/write, `getCurrentUser`, `requireUser`.
- `access.ts` — `canAccess`, `requireAccess` (the single chokepoint for security).
- `schemas.ts` — Zod schemas for every API input.
- `sanitize.ts` — DOMPurify config for stored HTML.

## Error handling

- API handlers wrapped so thrown `AppError(status, message)` → clean JSON
  `{ error }`. Unexpected errors → 500 `{ error: "Something went wrong" }`, details
  logged server-side only.

## Persistence of formatting

TipTap edits HTML; on save we **sanitize** then store the HTML string. On reopen we
load and set it back into the editor. Simple, lossless for our formatting set, and
avoids schema churn. (Alternative — storing ProseMirror JSON — noted in DECISIONS.)

## Deployment shape (Phase 2)

- App → Vercel. DB → Neon Postgres. Swap Prisma provider `sqlite`→`postgresql`,
  set `DATABASE_URL`, run `prisma migrate deploy` + seed. HTTPS and at-rest
  encryption are provided by the platforms.
