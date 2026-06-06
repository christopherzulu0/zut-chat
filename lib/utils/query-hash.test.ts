import { describe, it, expect } from "vitest";
import { hashQuery } from "./query-hash";

describe("hashQuery", () => {
  it("returns stable hashes for the same input", () => {
    expect(hashQuery("fees")).toBe(hashQuery("fees"));
    expect(hashQuery("fees")).not.toBe(hashQuery("admissions"));
  });
});
