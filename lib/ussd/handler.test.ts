import { describe, it, expect, vi, beforeEach } from "vitest";
import { MAIN_MENU } from "./menus";

vi.mock("@/lib/rag/chain", () => ({
  runRagQuery: vi.fn().mockResolvedValue({
    answer: "Tuition is K7,445 per semester.",
    sources: [{ source: "fees.pdf", page: 1 }],
    confidence: 90,
    shouldEscalate: false,
    latencyMs: 100,
  }),
  truncateForUssd: (t: string) => t.slice(0, 160),
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: () => false,
}));

describe("USSD menus", () => {
  it("shows main menu on empty text", async () => {
    const { handleUssd } = await import("./handler");
    const res = await handleUssd({
      sessionId: "s1",
      phoneNumber: "+260970000000",
      serviceCode: "*384*1#",
      text: "",
    });
    expect(res).toBe(MAIN_MENU);
    expect(res.startsWith("CON")).toBe(true);
  });
});
