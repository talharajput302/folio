// A typed, expected application error. Thrown by lib/route code and converted to
// a safe JSON response by `errorResponse`. Never leaks internals to the client.
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}
