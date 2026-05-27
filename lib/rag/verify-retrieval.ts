import {
  OPENAI_EMBEDDING_DIMENSION,
  OPENAI_EMBEDDING_MODEL,
} from "@/lib/ai/config";
import { getQueryEmbeddings } from "./embeddings";
import { getPineconeIndex } from "./pinecone";

const PROBE_QUERY = "How much is tuition fee for diploma in IT?";
const MIN_HEALTHY_SCORE = 0.35;

export type RetrievalHealth = {
  ok: boolean;
  indexDimension?: number;
  embeddingDimension: number;
  totalRecords: number;
  topScore: number;
  message: string;
};

export async function checkRetrievalHealth(): Promise<RetrievalHealth> {
  const index = getPineconeIndex();
  const embeddings = getQueryEmbeddings();

  const stats = await index.describeIndexStats();
  const totalRecords = stats.totalRecordCount ?? 0;
  const indexDimension = stats.dimension;

  const queryVector = await embeddings.embedQuery(PROBE_QUERY);
  const embeddingDimension = queryVector.length;

  if (
    indexDimension != null &&
    indexDimension !== embeddingDimension
  ) {
    return {
      ok: false,
      indexDimension,
      embeddingDimension,
      totalRecords,
      topScore: 0,
      message:
        `Pinecone index dimension is ${indexDimension} but OpenAI embeddings are ${embeddingDimension}. ` +
        `Recreate the index with dimension ${embeddingDimension} or set OPENAI_EMBEDDING_DIMENSION=${indexDimension} and re-seed.`,
    };
  }

  if (totalRecords === 0) {
    return {
      ok: false,
      indexDimension,
      embeddingDimension,
      totalRecords,
      topScore: 0,
      message: "Index is empty. Run pnpm seed:reset",
    };
  }

  const res = await index.query({
    vector: queryVector,
    topK: 3,
    includeMetadata: true,
  });

  const topScore = res.matches?.[0]?.score ?? 0;

  if (topScore < MIN_HEALTHY_SCORE) {
    return {
      ok: false,
      indexDimension,
      embeddingDimension,
      totalRecords,
      topScore,
      message:
        `Top similarity score is ${topScore.toFixed(3)} (expected ≥ ${MIN_HEALTHY_SCORE}). ` +
        `Vectors were likely indexed with a different embedding model (e.g. Gemini). ` +
        `Run: pnpm seed:reset`,
    };
  }

  return {
    ok: true,
    indexDimension,
    embeddingDimension,
    totalRecords,
    topScore,
    message: `Retrieval OK (model=${OPENAI_EMBEDDING_MODEL}, dim=${embeddingDimension}, topScore=${topScore.toFixed(3)})`,
  };
}
