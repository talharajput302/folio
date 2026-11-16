import { describe, it, expect } from "vitest";
import { decideRole } from "./access";

// The core authorization rule — the single most important piece of security
// logic in the app. A document is accessible only to its owner or users it has
// been explicitly shared with.
describe("decideRole (access control)", () => {
  const doc = {
    ownerId: "alice",
    shares: [{ userId: "bob" }],
  };

  it("grants OWNER to the document owner", () => {
    expect(decideRole(doc, "alice")).toBe("owner");
  });

  it("grants EDITOR to a shared user", () => {
    expect(decideRole(doc, "bob")).toBe("editor");
  });

  it("denies access (null) to an unrelated user — the IDOR defense", () => {
    expect(decideRole(doc, "carol")).toBeNull();
  });

  it("denies access when there are no shares and user is not owner", () => {
    expect(decideRole({ ownerId: "alice", shares: [] }, "carol")).toBeNull();
  });
});
