import { describe, expect, it } from "vitest";

describe("getClerkUserContact", () => {
  it("module exports contact helper", async () => {
    const mod = await import("./clerk-user");
    expect(typeof mod.getClerkUserContact).toBe("function");
  });
});
