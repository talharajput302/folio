import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { validateUpload, textToHtml, titleFromFilename } from "@/lib/import";
import { sanitizeHtml } from "@/lib/sanitize";

// POST /api/upload  (multipart/form-data, field "file")
// Accepts a .txt/.md file (<=1 MB) and creates a new editable document from it.
export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new AppError(400, "No file provided.");
    }

    const check = validateUpload(file.name, file.size);
    if (!check.ok) {
      throw new AppError(400, check.error);
    }

    const text = await file.text();
    const content = sanitizeHtml(textToHtml(text));

    const doc = await prisma.document.create({
      data: {
        title: titleFromFilename(file.name),
        content,
        ownerId: user.id,
      },
      select: { id: true, title: true },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
