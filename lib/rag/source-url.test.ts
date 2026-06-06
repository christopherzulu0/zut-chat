import { describe, expect, it } from "vitest";
import {
  isViewableKnowledgeSource,
  resolveSourceViewerUrl,
  sourceBasename,
} from "./source-url";

describe("source-url", () => {
  it("resolves viewer URLs for knowledge markdown files", () => {
    expect(resolveSourceViewerUrl("zut-faq.md")).toBe("/sources/zut-faq.md");
    expect(resolveSourceViewerUrl("zut-faq.md", 2)).toBe(
      "/sources/zut-faq.md?page=2"
    );
    expect(
      resolveSourceViewerUrl("data/knowledge/academic-calendar-2026-2027.md", 1)
    ).toBe("/sources/academic-calendar-2026-2027.md?page=1");
  });

  it("returns null for PDF-only seed sources", () => {
    expect(resolveSourceViewerUrl("ZUT_Fees_Handbook_2026.pdf")).toBeNull();
  });

  it("detects viewable knowledge sources", () => {
    expect(isViewableKnowledgeSource("zut-faq.md")).toBe(true);
    expect(isViewableKnowledgeSource("ZUT_Fees_Handbook_2026.pdf")).toBe(false);
  });

  it("extracts basename from paths", () => {
    expect(sourceBasename("folder/zut-faq.md")).toBe("zut-faq.md");
  });
});
