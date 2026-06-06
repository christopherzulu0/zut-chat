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
  const data: Prisma.MessageUncheckedCreateInput = {
    conversationId: params.conversationId,
    role: params.role,
    content: params.content,
    sources: (params.sources ?? undefined) as Prisma.InputJsonValue | undefined,
    confidence: params.confidence ?? null,
    latencyMs: params.latencyMs ?? null,
  };

  const msg = await prisma.message.create({ data });
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
  userName?: string | null;
  userEmail?: string | null;
  summary: string;
  channel: Channel;
}) {
  const data: Prisma.EscalationUncheckedCreateInput = {
    conversationId: params.conversationId ?? null,
    contact: params.contact,
    userName: params.userName ?? null,
    userEmail: params.userEmail ?? null,
    summary: params.summary,
    channel: params.channel,
  };

  return prisma.escalation.create({ data });
}

export async function getEscalations(options?: {
  status?: "open" | "in_progress" | "resolved";
  limit?: number;
}) {
  const { status, limit = 50 } = options ?? {};

  return prisma.escalation.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      conversation: {
        select: {
          id: true,
          userId: true,
          messages: {
            orderBy: { createdAt: "asc" },
            take: 12,
            select: {
              id: true,
              role: true,
              content: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });
}

export async function getEscalationCounts() {
  const [open, inProgress, resolved] = await Promise.all([
    prisma.escalation.count({ where: { status: "open" } }),
    prisma.escalation.count({ where: { status: "in_progress" } }),
    prisma.escalation.count({ where: { status: "resolved" } }),
  ]);

  return {
    open,
    in_progress: inProgress,
    resolved,
    total: open + inProgress + resolved,
  };
}

export async function updateEscalationStatus(
  id: string,
  status: "open" | "in_progress" | "resolved"
) {
  return prisma.escalation.update({
    where: { id },
    data: { status },
  });
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
