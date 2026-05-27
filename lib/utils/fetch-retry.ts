function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  const cause = (error as { cause?: { code?: string } }).cause;
  return (
    msg.includes("fetch failed") ||
    msg.includes("timeout") ||
    msg.includes("aborted") ||
    cause?.code === "UND_ERR_CONNECT_TIMEOUT" ||
    cause?.code === "ETIMEDOUT" ||
    cause?.code === "ECONNRESET"
  );
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit | undefined,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  options?: { retries?: number; timeoutMs?: number; label?: string }
): Promise<Response> {
  const retries = options?.retries ?? Number(process.env.GEMINI_FETCH_RETRIES ?? 3);
  const timeoutMs =
    options?.timeoutMs ?? Number(process.env.GEMINI_FETCH_TIMEOUT_MS ?? 60_000);
  const label = options?.label ?? "API";

  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetchWithTimeout(url, init, timeoutMs);
    } catch (error) {
      lastError = error;
      if (!isRetryableFetchError(error) || attempt === retries) {
        break;
      }
      await sleep(1000 * attempt);
    }
  }

  const detail =
    lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(
    `${label} request failed after ${retries} attempt(s). Check your internet connection and API keys. (${detail})`
  );
}
