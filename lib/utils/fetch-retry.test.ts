import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchWithRetry } from "./fetch-retry";

describe("fetchWithRetry", () => {
  beforeEach(() => {
    vi.stubEnv("GEMINI_FETCH_RETRIES", "2");
    vi.stubEnv("GEMINI_FETCH_TIMEOUT_MS", "5000");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("retries on connect timeout then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new TypeError("fetch failed"), {
          cause: { code: "UND_ERR_CONNECT_TIMEOUT" },
        })
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    vi.stubGlobal("fetch", fetchMock);

    const res = await fetchWithRetry("https://example.com", {}, { retries: 2 });
    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
