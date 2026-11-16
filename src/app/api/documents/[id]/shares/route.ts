import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireAccess } from "@/lib/access";
import { shareSchema } from "@/lib/schemas";
import { errorResponse } from "@/lib/api";
import { AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

// GET /api/documents/:id/shares — list collaborators. Any member may view.
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { doc } = await requireAccess(user.id, params.id);

    const collaborators = doc.shares.map((s) => ({
      userId: s.userId,
      name: s.user.name,
      email: s.user.email,
      role: s.role,
    }));

    return NextResponse.json({
      owner: { name: doc.owner.name, email: doc.owner.email },
      collaborators,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

// POST /api/documents/:id/shares  { email, role? } — owner grants access by
// email. Validates: recipient exists, isn't the owner, isn't already shared.
export async function POST(req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { doc } = await requireAccess(user.id, params.id, { ownerOnly: true });

    const body = await req.json();
    const { email, role } = shareSchema.parse(body);

    const recipient = await prisma.user.findUnique({ where: { email } });
    if (!recipient) {
      throw new AppError(404, "No user with that email. Try bob@demo.com or carol@demo.com.");
    }
    if (recipient.id === doc.ownerId) {
      throw new AppError(400, "You already own this document.");
    }

    await prisma.share.upsert({
      where: { documentId_userId: { documentId: doc.id, userId: recipient.id } },
      update: { role },
      create: { documentId: doc.id, userId: recipient.id, role },
    });

    return NextResponse.json(
      { userId: recipient.id, name: recipient.name, email: recipient.email, role },
      { status: 201 },
    );
  } catch (e) {
    return errorResponse(e);
  }
}

// DELETE /api/documents/:id/shares?userId=... — owner revokes access.
export async function DELETE(req: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { doc } = await requireAccess(user.id, params.id, { ownerOnly: true });

    const userId = new URL(req.url).searchParams.get("userId");
    if (!userId) throw new AppError(400, "userId is required.");

    await prisma.share.deleteMany({ where: { documentId: doc.id, userId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
