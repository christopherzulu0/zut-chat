import { cookies } from "next/headers";
import { nanoid } from "nanoid";

const GUEST_COOKIE = "zut_guest_session";
const GUEST_QUERY_LIMIT = 10;

export async function getGuestSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(GUEST_COOKIE)?.value;
  if (existing) return existing;
  const id = nanoid();
  jar.set(GUEST_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return id;
}

const guestQueryCounts = new Map<string, { count: number; resetAt: number }>();

export function checkGuestRateLimit(sessionId: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const entry = guestQueryCounts.get(sessionId);
  if (!entry || entry.resetAt < now) {
    guestQueryCounts.set(sessionId, {
      count: 1,
      resetAt: now + 24 * 60 * 60 * 1000,
    });
    return { allowed: true, remaining: GUEST_QUERY_LIMIT - 1 };
  }
  if (entry.count >= GUEST_QUERY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  entry.count += 1;
  return { allowed: true, remaining: GUEST_QUERY_LIMIT - entry.count };
}

export function hashQuery(query: string): string {
  let h = 0;
  for (let i = 0; i < query.length; i++) {
    h = (h << 5) - h + query.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}
