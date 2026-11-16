import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";

// Converts any thrown error into a safe JSON response.
// - AppError  -> its status + message (intended for the user)
// - ZodError  -> 400 with a flattened field map
// - anything else -> 500 generic message; real error logged server-side only
export function errorResponse(e: unknown): NextResponse {
  if (e instanceof AppError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  if (e instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid input", details: e.flatten().fieldErrors },
      { status: 400 },
    );
  }
  // Unexpected: log for ourselves, hide details from the client.
  console.error("[unexpected]", e);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}
