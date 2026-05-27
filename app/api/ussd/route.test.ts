import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/ussd/handler", () => ({
  handleUssd: vi.fn().mockResolvedValue("CON ZUT Student Support\n1. Admissions"),
}));

describe("USSD API route", () => {
  it("returns plain text response", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/ussd", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "sessionId=s1&phoneNumber=%2B260970000000&serviceCode=*1%23&text=",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/plain");
    const text = await res.text();
    expect(text).toContain("CON");
  });
});
