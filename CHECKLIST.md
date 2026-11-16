# Master Checklist — maps every assignment requirement to our build

## 1. Document creation & editing
- [x] Create a new document
- [x] Rename a document (inline title)
- [x] Edit content in the browser
- [x] Save and reopen (persists, autosave)
- [x] Bold
- [x] Italic
- [x] Underline
- [x] Headings / text-size variation (H1–H3)
- [x] Bulleted list
- [x] Numbered list
- [x] Editing flow feels usable & coherent

## 2. File upload
- [x] Upload a `.txt`/`.md` file → becomes a new editable document
- [x] Supported types stated clearly in UI
- [x] Supported types stated in README
- [x] Size/type validation with clear error

## 3. Sharing
- [x] Every document has an owner
- [x] Owner can grant another user access (by email)
- [x] Visible distinction: Owned vs Shared-with-me
- [x] Shared user can open/edit
- [x] Outsider is blocked (404) — access control enforced server-side
- [x] Only owner can delete/share

## 4. Persistence
- [x] Documents remain after refresh
- [x] Formatting/structure preserved
- [x] Shared access demonstrable after refresh

## 5. Product & engineering quality
- [x] Clear setup & run instructions (README)
- [ ] Working deployment URL reviewers can access (Phase 2)
- [x] Basic validation & error handling
- [x] Meaningful automated tests (24 Vitest)
- [x] Architecture note explaining priorities
- [x] Security handled (injection, XSS, access control, bcrypt) + note

## 6. AI-native workflow note
- [x] Which AI tools used
- [x] Where AI sped work up
- [x] What AI output was changed/rejected
- [x] How correctness/UX/reliability were verified

## 7. Walkthrough video (user records)
- [ ] Script/points prepared
- [ ] Recorded & uploaded (unlisted)

## 8. Deliverables / submission
- [x] Source code
- [x] README.md (local setup + run)
- [x] Architecture note (md)
- [x] AI workflow note (md)
- [x] SECURITY note (md)
- [x] SUBMISSION.md (self-contained, pasteable)
- [ ] Live product URL (Phase 2)
- [ ] Video link
- [x] Account signup documented (no pre-made accounts)
- [x] Partial features: working / incomplete / next-2–4h stated

## Security sub-checklist
- [x] No raw SQL (Prisma only)
- [x] DOMPurify on stored/rendered HTML
- [x] Access control chokepoint on every read/write
- [x] Zod on every endpoint
- [x] Passwords bcrypt-hashed; generic login error
- [x] Secrets in env, gitignored
- [x] Safe error envelope (no stack traces to client)
- [x] Only trusted, correctly-spelled packages; lockfile committed
