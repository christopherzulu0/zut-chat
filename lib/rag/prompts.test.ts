import { describe, it, expect } from "vitest";
import { CATEGORY_QUERIES, RAG_SYSTEM_PROMPT } from "./prompts";

describe("RAG prompts", () => {
  it("defines all intent categories", () => {
    expect(CATEGORY_QUERIES.fees).toContain("tuition");
    expect(CATEGORY_QUERIES.admissions).toBeDefined();
    expect(CATEGORY_QUERIES.id).toBeDefined();
  });

  it("instructs context-only answers", () => {
    expect(RAG_SYSTEM_PROMPT).toContain("ONLY");
    expect(RAG_SYSTEM_PROMPT).toContain("official");
  });
});
