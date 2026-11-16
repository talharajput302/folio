import { prisma } from "./db";
import { AppError } from "./errors";

export type AccessRole = "owner" | "editor";

// Pure authorization decision — no DB, easy to unit test.
// A user is the OWNER if they own the doc, an EDITOR if a share exists for them,
// otherwise they have NO access (null).
export function decideRole(
  doc: { ownerId: string; shares: { userId: string }[] },
  userId: string,
): AccessRole | null {
  if (doc.ownerId === userId) return "owner";
  if (doc.shares.some((s) => s.userId === userId)) return "editor";
  return null;
}

// Loads a document only if the user may access it. Returns null otherwise.
export async function getAccessibleDocument(userId: string, documentId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      shares: { include: { user: true } },
      owner: true,
    },
  });
  if (!doc) return null;
  const role = decideRole(doc, userId);
  if (!role) return null;
  return { doc, role };
}

// Enforces access. Throws 404 if the user cannot access the document (we return
// 404 rather than 403 so we don't even reveal that the document exists — this is
// the IDOR defense). Pass { ownerOnly: true } for owner-restricted actions.
export async function requireAccess(
  userId: string,
  documentId: string,
  opts: { ownerOnly?: boolean } = {},
) {
  const result = await getAccessibleDocument(userId, documentId);
  if (!result) throw new AppError(404, "Document not found.");
  if (opts.ownerOnly && result.role !== "owner") {
    throw new AppError(403, "Only the owner can perform this action.");
  }
  return result;
}
