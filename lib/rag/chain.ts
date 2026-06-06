import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import {
  getOpenAiApiKey,
  OPENAI_CHAT_MODEL,
  RAG_MIN_HARD_FLOOR,
  RAG_MIN_SCORE,
} from "@/lib/ai/config";
import { getQueryEmbeddings } from "./embeddings";
import { getPineconeIndex } from "./pinecone";
import { RAG_SYSTEM_PROMPT } from "./prompts";
import type { RagResult, SourceCitation, ChunkMetadata } from "./types";

const TOP_K = 5;

const NO_CONTEXT_ANSWER =
  "I could not find reliable information in the official ZUT documents for your question. Please contact the registrar office or press 'Contact staff' to escalate to a human advisor.";

const EMPTY_INDEX_HINT =
  "The knowledge base appears empty. An admin must run `pnpm seed` (or Admin → Seed) after setting OPENAI_API_KEY and Pinecone.";

type HistoryMessage = { role: "user" | "assistant"; content: string };

function metadataText(meta: Record<string, unknown> | undefined): string {
  if (!meta) return "";
  const text = meta.text;
  if (typeof text === "string" && text.trim()) return text;
  return "";
}

function buildContext(
  matches: { metadata?: ChunkMetadata | Record<string, unknown>; score?: number }[]
): { context: string; sources: SourceCitation[]; topScore: number } {
  const sources: SourceCitation[] = [];
  const parts: string[] = [];
  let topScore = 0;

  for (const match of matches) {
    const meta = match.metadata;
    const text = metadataText(meta as Record<string, unknown> | undefined);
    if (!text) continue;
    const score = match.score ?? 0;
    topScore = Math.max(topScore, score);
    const source = String((meta as ChunkMetadata)?.source ?? "unknown");
    const page = (meta as ChunkMetadata)?.page;
    const category = String((meta as ChunkMetadata)?.category ?? "general");
    sources.push({
      source,
      page: typeof page === "number" ? page : undefined,
      category,
      text: text.slice(0, 200),
    });
    parts.push(
      `[${source}${page ? `, p.${page}` : ""}] (${category})\n${text}`
    );
  }

  return { context: parts.join("\n\n---\n\n"), sources, topScore };
}

export async function runRagQuery(
  question: string,
  options?: {
    history?: HistoryMessage[];
    category?: string;
    maxTokens?: number;
  }
): Promise<RagResult> {
  const start = Date.now();
  const embeddings = getQueryEmbeddings();
  const index = getPineconeIndex();
  const queryVector = await embeddings.embedQuery(question);

  const filter = options?.category
    ? { category: { $eq: options.category } }
    : undefined;

  const queryResponse = await index.query({
    vector: queryVector,
    topK: TOP_K,
    includeMetadata: true,
    filter,
  });

  const matches = (queryResponse.matches ?? []).map((m) => ({
    metadata: m.metadata as ChunkMetadata | undefined,
    score: m.score ?? 0,
  }));

  const { context, sources, topScore } = buildContext(matches);
  const hasContext = context.trim().length > 0;

  if (!matches.length) {
    let hint = NO_CONTEXT_ANSWER;
    try {
      const stats = await index.describeIndexStats();
      const total = stats.totalRecordCount ?? 0;
      if (total === 0) {
        hint = `${NO_CONTEXT_ANSWER} ${EMPTY_INDEX_HINT}`;
        console.warn("[rag] Pinecone index has 0 vectors — run pnpm seed");
      }
    } catch {
      // stats optional
    }
    return {
      answer: hint,
      sources: [],
      confidence: 0,
      shouldEscalate: true,
      latencyMs: Date.now() - start,
    };
  }

  if (!hasContext || topScore < RAG_MIN_HARD_FLOOR) {
    if (process.env.NODE_ENV === "development") {
      const mismatchHint =
        topScore < 0.15 && matches.length > 0
          ? " — likely old Gemini vectors; run: pnpm seed:reset"
          : "";
      console.warn(
        `[rag] Low retrieval:${mismatchHint}`,
        {
          topScore,
          matchCount: matches.length,
          hasTextMetadata: matches.some((m) => metadataText(m.metadata)),
        }
      );
    }
    return {
      answer: NO_CONTEXT_ANSWER,
      sources: [],
      confidence: Math.round(topScore * 100),
      shouldEscalate: true,
      latencyMs: Date.now() - start,
    };
  }

  const model = new ChatOpenAI({
    apiKey: getOpenAiApiKey(),
    model: OPENAI_CHAT_MODEL,
    temperature: 0.2,
    maxTokens: options?.maxTokens ?? 512,
  });

  const historyMessages = (options?.history ?? []).slice(-6).map((m) =>
    m.role === "user"
      ? new HumanMessage(m.content)
      : new AIMessage(m.content)
  );

  const response = await model.invoke([
    new SystemMessage(RAG_SYSTEM_PROMPT),
    ...historyMessages,
    new HumanMessage(
      `Context from official documents:\n${context}\n\nStudent question: ${question}`
    ),
  ]);

  const answer =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  const lowConfidence = topScore < RAG_MIN_SCORE;

  return {
    answer,
    sources,
    confidence: Math.round(topScore * 100),
    shouldEscalate: lowConfidence,
    latencyMs: Date.now() - start,
  };
}

export async function* streamRagQuery(
  question: string,
  options?: { history?: HistoryMessage[]; category?: string }
): AsyncGenerator<
  | { type: "token"; content: string }
  | { type: "done"; result: RagResult }
> {
  const result = await runRagQuery(question, options);
  const words = result.answer.split(/(\s+)/);
  for (const word of words) {
    yield { type: "token", content: word };
    await new Promise((r) => setTimeout(r, 8));
  }
  yield { type: "done", result };
}
