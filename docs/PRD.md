# PRD — Folio

## 1. Problem & goal

Teams need a fast, shared way to write and hand off documents. Build the strongest
working slice of a collaborative rich-text editor within a 4–6 hour timebox,
demonstrating product judgment, full-stack execution, and mature AI-assisted
workflow.

## 2. Target user

An internal team member who creates docs, formats them, uploads existing text
files to turn into docs, and shares specific docs with specific teammates.

## 3. In scope (the committed slice)

1. **Document CRUD**
   - Create a new document
   - Rename a document
   - Edit rich-text content in the browser
   - Save (autosave + explicit) and reopen later
2. **Rich-text formatting**
   - Bold, italic, underline
   - Headings / text-size variation
   - Bulleted and numbered lists
3. **File upload**
   - Upload a `.txt` or `.md` file → becomes a new editable document
   - Supported types stated clearly in the UI
4. **Sharing**
   - Every document has an owner
   - Owner grants another user access by email
   - UI clearly separates **Owned** vs **Shared with me**
   - Shared users can open and edit; only the owner can delete/share
5. **Persistence**
   - Documents + shares survive refresh (SQLite via Prisma)
   - Formatting preserved (stored as sanitized HTML)
6. **Quality**
   - Setup/run instructions (README)
   - Validation + error handling
   - At least one meaningful automated test (access control)
   - Architecture + AI + security notes
   - Deployable build

## 4. Out of scope (deliberate cuts — see docs/DECISIONS.md)

- Real-time multi-cursor collaboration (OT/CRDT)
- Full auth (password reset, email verification, OAuth)
- Comments, version history, suggestions (stretch only if time permits)
- `.docx` parsing (txt/md only; stated in UI)
- Granular role matrix beyond owner + editor
- App-level content encryption (transit + at-rest encryption only)

## 5. User stories

- As a user, I can sign up and sign in with email + password.
- As an owner, I can create, rename, edit, and delete my documents.
- As an owner, I can share a document with another user by email.
- As a recipient, I see shared docs in a separate "Shared with me" section and can
  edit them.
- As any user, I cannot access a document I neither own nor am shared on.
- As a user, I can upload a `.txt`/`.md` file and it becomes an editable document.

## 6. Success criteria

Reviewer can: log in, create/format/rename/save a doc, reopen after refresh,
upload a file into a doc, share with a second seeded user, verify the second user
sees it under "Shared with me", and verify a third user is blocked.

## 7. Supported file types

`.txt`, `.md` only. Max 1 MB. Stated in the upload UI and README.

## 8. Submission format (how reviewers receive this)

Submission is a form: a **public video link** + a **Markdown writeup (max 1000
lines)**. Therefore `SUBMISSION.md` must be self-contained and concise — live URL,
local setup, seeded accounts, what works / what's partial, and the AI note — all
pasteable into that box.
