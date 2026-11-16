# Security Notes — Folio

Security appropriate to a 4–6 hour product slice: we implement the controls a
reviewer would actually probe, and explicitly name what we deferred.

## Threat model (what we defend against)

| Threat | Mitigation | Status |
|--------|-----------|--------|
| **SQL injection** | All DB access via Prisma (parameterized queries). No raw SQL, no string-built queries. | ✅ |
| **Stored XSS** (malicious HTML in a doc runs for another user) | Rich-text HTML is run through DOMPurify (`isomorphic-dompurify`) before being stored and before rendering. Script/iframe/event-handler attributes stripped. | ✅ |
| **Broken access control / IDOR** (guessing another user's doc id) | Every read/write passes through `requireAccess()`: caller must be owner or shared-with, else **404** (existence not leaked). Enforced server-side, never trusting client. | ✅ |
| **Invalid / malformed input** | Zod validates every API payload (types, lengths, enum roles) before use. | ✅ |
| **Privilege escalation** (editor deletes/shares) | Delete and share restricted to the document owner; checked server-side. | ✅ |
| **Credential storage** | Passwords stored only as **bcrypt** hashes (cost 10). Login returns one generic error for unknown-email or wrong-password (no account enumeration). Strong-password rules enforced server-side. | ✅ |
| **Secret leakage** | Secrets only in env vars; `.env*` gitignored; no secrets in client bundle. | ✅ |
| **Verbose error leakage** | Handlers return generic messages; stack traces/DB errors logged server-side only. | ✅ |
| **Oversized upload / DoS via file** | Upload limited to `.txt`/`.md`, max 1 MB; content sanitized. | ✅ |
| **Data in transit** | HTTPS enforced by host (Vercel) in production. | ✅ (prod) |
| **Data at rest** | Encrypted at rest by the DB host (Neon/Postgres) in production. | ✅ (prod) |

## Supply-chain / dependency hygiene

- Only well-known, correctly-spelled packages; exact names verified before install
  (defense against typosquatting). pnpm lockfile committed for reproducible builds.
- No `postinstall` scripts from unknown packages; no piping remote scripts to a
  shell.

## Deliberately out of scope (and why)

- **Email verification, password reset, OAuth.** Core auth (signup/login with
  hashed passwords) is implemented; these extras are the first production adds.
- **Rate limiting / brute-force protection** on the login endpoint. Next step.
- **App-level (end-to-end) content encryption.** Would break sharing/search and is
  not how comparable products behave; transit + at-rest encryption is the right
  bar here.
- **Audit logs, 2FA, CSRF tokens on top of same-site cookies.** Noted as next steps.

## What I'd add with 2–4 more hours

1. Rate limiting + brute-force protection on login; CSRF tokens on mutations.
2. Email verification and password reset.
3. Per-field authorization tests expanded into a full matrix.
