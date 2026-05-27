import { auth } from "@clerk/nextjs/server";

export type UserRole = "student" | "admin" | "prospect";

export async function getAuthContext() {
  const session = await auth();
  const role =
    (session.sessionClaims?.metadata as { role?: UserRole } | undefined)?.role ??
    (session.sessionClaims?.publicMetadata as { role?: UserRole } | undefined)
      ?.role ??
    "prospect";
  return {
    userId: session.userId,
    isSignedIn: Boolean(session.userId),
    role: role as UserRole,
  };
}

export async function requireAdmin() {
  const ctx = await getAuthContext();
  if (!ctx.userId) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }
  if (ctx.role !== "admin") {
    return { ok: false as const, status: 403, error: "Admin access required" };
  }
  return { ok: true as const, userId: ctx.userId };
}
