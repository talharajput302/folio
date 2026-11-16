import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createDocumentSchema } from "@/lib/schemas";
import { errorResponse } from "@/lib/api";

// Reads the session cookie, so it must be rendered per-request (never static).
export const dynamic = "force-dynamic";

// GET /api/documents — lists the current user's documents, split into
// { owned, shared } so the UI can show the distinction.
export async function GET() {
  try {
    const user = await requireUser();

    const owned = await prisma.document.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, updatedAt: true },
    });

    const sharedRows = await prisma.share.findMany({
      where: { userId: user.id },
      orderBy: { document: { updatedAt: "desc" } },
      select: {
        role: true,
        document: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
            owner: { select: { name: true, email: true } },
          },
        },
      },
    });

    const shared = sharedRows.map((r) => ({
      id: r.document.id,
      title: r.document.title,
      updatedAt: r.document.updatedAt,
      role: r.role,
      owner: r.document.owner,
    }));

    return NextResponse.json({ owned, shared });
  } catch (e) {
    return errorResponse(e);
  }
}

// POST /api/documents — creates a new empty document owned by the current user.
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const { title } = createDocumentSchema.parse(body);

    const doc = await prisma.document.create({
      data: {
        // Empty by default so the editor shows a placeholder until the user types.
        title: title ?? "",
        content: "",
        ownerId: user.id,
      },
      select: { id: true, title: true },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
