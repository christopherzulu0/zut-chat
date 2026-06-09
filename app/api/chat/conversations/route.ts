import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isDbConfigured } from "@/lib/db/client";
import { listUserConversations } from "@/lib/db/queries";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ conversations: [], hasMore: false, total: 0 });
  }

  const { searchParams } = req.nextUrl;
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0) || 0);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(searchParams.get("limit") ?? DEFAULT_LIMIT) || DEFAULT_LIMIT)
  );

  const result = await listUserConversations(session.userId, { limit, offset });
  return NextResponse.json(result);
}
