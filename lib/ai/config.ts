/** Shared OpenAI configuration for chat and embeddings. */

export function isOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getOpenAiApiKey(): string {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return key;
}

export const OPENAI_CHAT_MODEL =
  process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";

export const OPENAI_EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";

export const OPENAI_EMBEDDING_DIMENSION = Number(
  process.env.OPENAI_EMBEDDING_DIMENSION ?? "768"
);

/** Delay between embedding calls during bulk seed (ms). */
export const OPENAI_EMBED_DELAY_MS = Number(
  process.env.OPENAI_EMBED_DELAY_MS ?? 300
);

/** Below this similarity, answers are flagged for human follow-up (still generated if context exists). */
export const RAG_MIN_SCORE = Number(process.env.RAG_MIN_SCORE ?? "0.5");

/** Below this, no LLM call — treat as no relevant documents (empty index or wrong embeddings). */
export const RAG_MIN_HARD_FLOOR = Number(process.env.RAG_MIN_HARD_FLOOR ?? "0.25");
