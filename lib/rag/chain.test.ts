import { describe, it, expect } from "vitest";

/** Mirrors buildContext scoring logic used in chain.ts */
function shouldHardFallback(
  topScore: number,
  hasContext: boolean
): boolean {
  const RAG_MIN_HARD_FLOOR = 0.25;
  return !hasContext || topScore < RAG_MIN_HARD_FLOOR;
}

describe("RAG retrieval thresholds", () => {
  it("allows answers when score is above hard floor with context", () => {
    expect(shouldHardFallback(0.55, true)).toBe(false);
    expect(shouldHardFallback(0.4, true)).toBe(false);
  });

  it("blocks when score is below hard floor", () => {
    expect(shouldHardFallback(0.2, true)).toBe(true);
  });

  it("blocks when there is no context", () => {
    expect(shouldHardFallback(0.9, false)).toBe(true);
  });
});
