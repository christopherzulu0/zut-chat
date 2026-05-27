import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { seedKnowledgeBase } from "@/lib/rag/ingest";
import { isOpenAiConfigured } from "@/lib/ai/config";
import { isPineconeConfigured } from "@/lib/rag/pinecone";

export async function POST() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  if (!isPineconeConfigured() || !isOpenAiConfigured()) {
    return NextResponse.json(
      { error: "Configure OPENAI_API_KEY and PINECONE_API_KEY first" },
      { status: 503 }
    );
  }

  const chunks = await seedKnowledgeBase();
  return NextResponse.json({ success: true, chunks });
}
