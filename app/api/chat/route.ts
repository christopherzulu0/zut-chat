import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { runRagQuery } from "@/lib/rag/chain";
import { isOpenAiConfigured } from "@/lib/ai/config";
import { isPineconeConfigured } from "@/lib/rag/pinecone";
import { isDbConfigured } from "@/lib/db/client";
import {
  getOrCreateConversation,
  getConversationMessages,
  addMessage,
  logQuery,
} from "@/lib/db/queries";
import {
  getGuestSessionId,
  checkGuestRateLimit,
  hashQuery,
} from "@/lib/guest-session";

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().uuid().optional(),
  escalate: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { message, conversationId, escalate } = parsed.data;
    const session = await auth();
    const userId = session.userId ?? null;

    if (!userId) {
      const guestId = await getGuestSessionId();
      const limit = checkGuestRateLimit(guestId);
      if (!limit.allowed) {
        return NextResponse.json(
          {
            error: "Guest limit reached. Sign in for unlimited access.",
            remaining: 0,
          },
          { status: 429 }
        );
      }
    }

    if (escalate) {
      if (!isDbConfigured()) {
        return NextResponse.json({
          answer:
            "Escalation recorded. Please email registrar@zut.ac.zm with your question.",
          escalated: true,
        });
      }
      const { createEscalation } = await import("@/lib/db/queries");
      const { notifyEscalation } = await import("@/lib/escalation/notify");
      const contact = userId ?? (await getGuestSessionId());
      const ticket = await createEscalation({
        conversationId,
        contact,
        summary: message,
        channel: "web",
      });
      await notifyEscalation(ticket);
      return NextResponse.json({
        answer: `Your request has been sent to staff. Reference: ${ticket.id.slice(0, 8)}`,
        escalated: true,
        ticketId: ticket.id,
      });
    }

    if (!isPineconeConfigured() || !isOpenAiConfigured()) {
      return NextResponse.json(
        {
          error: "AI services not configured. Set OPENAI_API_KEY and PINECONE_API_KEY.",
        },
        { status: 503 }
      );
    }

    let history: { role: "user" | "assistant"; content: string }[] = [];
    let convId = conversationId;

    if (isDbConfigured()) {
      const guestId = userId ? null : await getGuestSessionId();
      const conv = await getOrCreateConversation({
        conversationId: convId,
        userId,
        guestSessionId: guestId,
        channel: "web",
      });
      convId = conv.id;
      const prior = await getConversationMessages(conv.id);
      history = prior.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      await addMessage({
        conversationId: conv.id,
        role: "user",
        content: message,
      });
    }

    const result = await runRagQuery(message, { history });

    if (isDbConfigured() && convId) {
      await addMessage({
        conversationId: convId,
        role: "assistant",
        content: result.answer,
        sources: result.sources,
        confidence: result.confidence,
        latencyMs: result.latencyMs,
      });
      await logQuery({
        channel: "web",
        queryHash: hashQuery(message),
        latencyMs: result.latencyMs,
        topScore: result.confidence / 100,
        escalated: result.shouldEscalate,
      });
    }

    return NextResponse.json({
      answer: result.answer,
      sources: result.sources,
      confidence: result.confidence,
      shouldEscalate: result.shouldEscalate,
      conversationId: convId,
      latencyMs: result.latencyMs,
    });
  } catch (e) {
    console.error("Chat API error:", e);
    return NextResponse.json(
      { error: "Failed to process your question. Please try again." },
      { status: 500 }
    );
  }
}
