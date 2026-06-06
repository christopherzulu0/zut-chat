import { auth } from "@clerk/nextjs/server";
import { getRoleFromClaims, type UserRole } from "@/lib/auth/roles";

export type { UserRole } from "@/lib/auth/roles";

export async function getAuthContext() {
  const session = await auth();
  const role = getRoleFromClaims(
    session.sessionClaims as {
      metadata?: { role?: string };
      publicMetadata?: { role?: string };
    },
    session.userId
  );

  return {
    userId: session.userId,
    isSignedIn: Boolean(session.userId),
    role: role as UserRole,
    isAdmin: role === "admin",
  };
}

export async function requireAdmin() {
  const ctx = await getAuthContext();
  if (!ctx.userId) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }
  if (!ctx.isAdmin) {
    return { ok: false as const, status: 403, error: "Admin access required" };
  }
  return { ok: true as const, userId: ctx.userId };
}
