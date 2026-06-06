import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRoleFromClaims } from "@/lib/auth/roles";

export async function GET() {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  const role = getRoleFromClaims(
    session.sessionClaims as {
      metadata?: { role?: string };
      publicMetadata?: { role?: string };
    },
    session.userId
  );

  return NextResponse.json({ isAdmin: role === "admin", role });
}
