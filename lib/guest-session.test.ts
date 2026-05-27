import { describe, it, expect } from "vitest";
import { checkGuestRateLimit, hashQuery } from "./guest-session";

describe("guest session", () => {
  it("allows queries under limit", () => {
    const id = "test-session-1";
    const r1 = checkGuestRateLimit(id);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBeGreaterThan(0);
  });

  it("hashes queries consistently", () => {
    expect(hashQuery("fees")).toBe(hashQuery("fees"));
    expect(hashQuery("fees")).not.toBe(hashQuery("admissions"));
  });
});
