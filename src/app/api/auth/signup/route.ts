import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSession, hashPassword } from "@/lib/auth";
import { signupSchema } from "@/lib/schemas";
import { errorResponse } from "@/lib/api";
import { AppError } from "@/lib/errors";

// POST /api/auth/signup  { name, email, password }
// Creates a new account and signs the user in.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = signupSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, "An account with that email already exists.");
    }

    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password) },
      select: { id: true, name: true, email: true },
    });

    setSession(user.id);
    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
