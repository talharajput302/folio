import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/schemas";
import { errorResponse } from "@/lib/api";
import { AppError } from "@/lib/errors";

// POST /api/auth/login  { email, password }
// Verifies credentials and starts a session. The same generic error is returned
// whether the email is unknown or the password is wrong (no account enumeration).
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    const ok = user && (await verifyPassword(password, user.passwordHash));
    if (!user || !ok) {
      throw new AppError(401, "Incorrect email or password.");
    }

    setSession(user.id);
    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch (e) {
    return errorResponse(e);
  }
}
