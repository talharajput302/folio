import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireAccess } from "@/lib/access";
import { updateDocumentSchema } from "@/lib/schemas";
import { sanitizeHtml } from "@/lib/sanitize";
import { errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

// GET /api/documents/:id — returns the document if the caller may access it.
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { doc, role } = await requireAccess(user.id, params.id);

    return NextResponse.json({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      role,
      owner: { name: doc.owner.name, email: doc.owner.email },
      updatedAt: doc.updatedAt,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

// PATCH /api/documents/:id — update title and/or content. Any member (owner or
// shared editor) may edit. Content is sanitized before persisting (XSS defense).
export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    await requireAccess(user.id, params.id); // 404 if no access

    const body = await req.json();
    const data = updateDocumentSchema.parse(body);

    const updated = await prisma.document.update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.content !== undefined ? { content: sanitizeHtml(data.content) } : {}),
      },
      select: { id: true, title: true, updatedAt: true },
    });

    return NextResponse.json(updated);
  } catch (e) {
    return errorResponse(e);
  }
}

// DELETE /api/documents/:id — owner only.
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    await requireAccess(user.id, params.id, { ownerOnly: true });

    await prisma.document.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
