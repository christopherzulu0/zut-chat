import { prisma } from "./client";
import type { SourceCitation } from "@/lib/rag/types";
import type { Channel, MessageRole, Prisma } from "@/generated/prisma";

export async function getOrCreateConversation(params: {
  conversationId?: string;
  userId?: string | null;
  guestSessionId?: string | null;
  channel?: Channel;
  phoneNumber?: string;
}) {
  if (params.conversationId) {
    const existing = await prisma.conversation.findUnique({
      where: { id: params.conversationId },
    });
    if (existing) return existing;
  }

  return prisma.conversation.create({
    data: {
      userId: params.userId ?? null,
      guestSessionId: params.guestSessionId ?? null,
      channel: params.channel ?? "web",
      phoneNumber: params.phoneNumber ?? null,
    },
  });
}

export async function getConversationMessages(conversationId: string) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function addMessage(params: {
  conversationId: string;
  role: MessageRole;
  content: string;
  sources?: SourceCitation[];
  confidence?: number;
  latencyMs?: number;
}) {
  const msg = await prisma.message.create({
    data: {
      conversationId: params.conversationId,
      role: params.role,
      content: params.content,
      sources: (params.sources ?? undefined) as Prisma.InputJsonValue | undefined,
      confidence: params.confidence ?? null,
      latencyMs: params.latencyMs ?? null,
    },
  });
  await prisma.conversation.update({
    where: { id: params.conversationId },
    data: { updatedAt: new Date() },
  });
  return msg;
}

export async function logQuery(params: {
  channel: Channel;
  queryHash: string;
  latencyMs: number;
  topScore: number;
  escalated: boolean;
}) {
  await prisma.queryLog.create({
    data: {
      channel: params.channel,
      queryHash: params.queryHash,
      latencyMs: params.latencyMs,
      topScore: Math.round(params.topScore),
      escalated: params.escalated ? 1 : 0,
    },
  });
}

export async function createEscalation(params: {
  conversationId?: string;
  contact: string;
  summary: string;
  channel: Channel;
}) {
  return prisma.escalation.create({
    data: {
      conversationId: params.conversationId ?? null,
      contact: params.contact,
      summary: params.summary,
      channel: params.channel,
    },
  });
}

export async function getEscalations(limit = 50) {
  return prisma.escalation.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUssdSession(sessionId: string) {
  return prisma.ussdSession.findUnique({
    where: { sessionId },
  });
}

export async function upsertUssdSession(params: {
  sessionId: string;
  step: string;
  payload?: Record<string, unknown>;
  phoneNumber?: string;
}) {
  await prisma.ussdSession.upsert({
    where: { sessionId: params.sessionId },
    create: {
      sessionId: params.sessionId,
      step: params.step,
      payload: (params.payload ?? undefined) as Prisma.InputJsonValue | undefined,
      phoneNumber: params.phoneNumber ?? null,
    },
    update: {
      step: params.step,
      payload: (params.payload ?? undefined) as Prisma.InputJsonValue | undefined,
      phoneNumber: params.phoneNumber ?? null,
    },
  });
}

export async function deleteUssdSession(sessionId: string) {
  await prisma.ussdSession.delete({ where: { sessionId } }).catch(() => {});
}

export async function listDocuments() {
  return prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createDocumentRecord(
  filename: string,
  category: string,
  chunkCount: number
) {
  return prisma.document.create({
    data: {
      filename,
      category,
      chunkCount,
      status: "indexed",
      indexedAt: new Date(),
    },
  });
}

export async function getMetrics() {
  const [aggregate, recent] = await Promise.all([
    prisma.queryLog.aggregate({
      _count: { id: true },
      _avg: { latencyMs: true },
      _sum: { escalated: true },
    }),
    prisma.queryLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const stats = {
    totalQueries: aggregate._count.id,
    avgLatency: Math.round(aggregate._avg.latencyMs ?? 0),
    escalationCount: aggregate._sum.escalated ?? 0,
  };

  return { stats, recent };
}
