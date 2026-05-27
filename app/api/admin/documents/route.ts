import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { ingestPdfBuffer } from "@/lib/rag/ingest";
import { isOpenAiConfigured } from "@/lib/ai/config";
import { isPineconeConfigured } from "@/lib/rag/pinecone";
import { isDbConfigured } from "@/lib/db/client";
import { createDocumentRecord, listDocuments } from "@/lib/db/queries";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ documents: [] });
  }
  const documents = await listDocuments();
  return NextResponse.json({ documents });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  if (!isPineconeConfigured() || !isOpenAiConfigured()) {
    return NextResponse.json(
      { error: "AI services not configured" },
      { status: 503 }
    );
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const category = (form.get("category") as string) || "general";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const chunkCount = await ingestPdfBuffer(buffer, file.name, category);

  let document = null;
  if (isDbConfigured()) {
    document = await createDocumentRecord(file.name, category, chunkCount);
  }

  return NextResponse.json({
    success: true,
    chunkCount,
    document,
  });
}
