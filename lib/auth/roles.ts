export type UserRole = "student" | "admin" | "prospect";

type SessionClaims = {
  metadata?: { role?: string };
  publicMetadata?: { role?: string };
};

function parseAdminUserIds(): Set<string> {
  const raw = process.env.ADMIN_USER_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  );
}

export function isAdminUserId(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return parseAdminUserIds().has(userId);
}

export function getRoleFromClaims(
  sessionClaims: SessionClaims | null | undefined,
  userId?: string | null
): UserRole {
  const claimRole =
    sessionClaims?.metadata?.role ?? sessionClaims?.publicMetadata?.role;

  if (claimRole === "admin") return "admin";
  if (claimRole === "student") return "student";
  if (isAdminUserId(userId)) return "admin";

  return claimRole === "prospect" ? "prospect" : "student";
}

export function getRoleFromPublicMetadata(
  publicMetadata: Record<string, unknown> | null | undefined,
  userId?: string | null
): UserRole {
  const role = publicMetadata?.role;
  if (role === "admin") return "admin";
  if (role === "student") return "student";
  if (isAdminUserId(userId)) return "admin";
  return "student";
}

export function isAdminRole(
  sessionClaims: SessionClaims | null | undefined,
  userId?: string | null
): boolean {
  return getRoleFromClaims(sessionClaims, userId) === "admin";
}
