import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isDbConfigured } from "@/lib/db/client";
import { getUserConversation } from "@/lib/db/queries";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const { id } = await params;
  const conversation = await getUserConversation(id, session.userId);

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        sources: m.sources,
        createdAt: m.createdAt,
      })),
    },
  });
}
