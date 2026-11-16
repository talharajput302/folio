import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { errorResponse } from "@/lib/api";

// POST /api/auth/logout — clears the session cookie.
export async function POST() {
  try {
    clearSession();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
