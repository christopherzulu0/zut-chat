import { describe, it, expect } from "vitest";
import { normalizeCalendarText, splitCalendarSections } from "./ingest";

describe("calendar ingest", () => {
  it("joins split ordinals", () => {
    const raw = "Monday 2\nnd February, 2026 Classes Begin";
    expect(normalizeCalendarText(raw)).toContain("Monday 2nd February, 2026");
  });

  it("splits into three semester sections", () => {
    const raw = `SEMESTER I
Line one 2026
SEMESTER II
Line two 2026
PROVISIONAL DATES FOR 2027
SEMESTER I
Line three 2027`;
    const sections = splitCalendarSections(raw);
    expect(sections).toHaveLength(3);
    expect(sections[0].title).toBe("Semester I 2026");
    expect(sections[2].title).toBe("Provisional 2027 Semester I");
  });
});
