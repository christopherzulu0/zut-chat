import { OpenAIEmbeddings } from "@langchain/openai";
import {
  getOpenAiApiKey,
  OPENAI_EMBEDDING_DIMENSION,
  OPENAI_EMBEDDING_MODEL,
  OPENAI_EMBED_DELAY_MS,
} from "@/lib/ai/config";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createEmbeddings(): OpenAIEmbeddings {
  return new OpenAIEmbeddings({
    apiKey: getOpenAiApiKey(),
    model: OPENAI_EMBEDDING_MODEL,
    dimensions: OPENAI_EMBEDDING_DIMENSION,
  });
}

/** Embed multiple texts one at a time (friendlier on rate limits / slow networks). */
async function embedTextsSequential(
  texts: string[],
  embed: (text: string) => Promise<number[]>
): Promise<number[][]> {
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i++) {
    if (i > 0 && OPENAI_EMBED_DELAY_MS > 0) {
      await sleep(OPENAI_EMBED_DELAY_MS);
    }
    results.push(await embed(texts[i]));
  }
  return results;
}

/** For indexing document chunks (Pinecone upsert). */
export function getEmbeddings() {
  const embeddings = createEmbeddings();
  return {
    embedQuery: (text: string) => embeddings.embedQuery(text),
    embedDocuments: (texts: string[]) =>
      embedTextsSequential(texts, (t) => embeddings.embedQuery(t)),
  };
}

/** For search queries at runtime. */
export function getQueryEmbeddings() {
  const embeddings = createEmbeddings();
  return {
    embedQuery: (text: string) => embeddings.embedQuery(text),
  };
}
