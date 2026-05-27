import { loadProjectEnv } from "../lib/env/load-env";
import {
  OPENAI_EMBEDDING_DIMENSION,
  OPENAI_EMBEDDING_MODEL,
} from "../lib/ai/config";
import { getQueryEmbeddings } from "../lib/rag/embeddings";
import { getPineconeIndex } from "../lib/rag/pinecone";
import { checkRetrievalHealth } from "../lib/rag/verify-retrieval";

loadProjectEnv();

const TEST_QUERIES = [
  "How much is tuition fee for diploma in IT?",
  "When do applications close?",
  "I lost my ID card",
];

async function main() {
  console.log(`Embedding: ${OPENAI_EMBEDDING_MODEL} (${OPENAI_EMBEDDING_DIMENSION}d)\n`);

  const health = await checkRetrievalHealth();
  console.log("Health:", health.message, "\n");

  const index = getPineconeIndex();
  const embeddings = getQueryEmbeddings();
  const stats = await index.describeIndexStats();
  console.log("Index stats:", JSON.stringify(stats, null, 2));

  const probe = await embeddings.embedQuery("test");
  console.log(`Query vector length: ${probe.length}\n`);

  for (const q of TEST_QUERIES) {
    const vector = await embeddings.embedQuery(q);
    const res = await index.query({
      vector,
      topK: 5,
      includeMetadata: true,
    });
    console.log(`--- "${q}" ---`);
    for (const m of res.matches ?? []) {
      const meta = m.metadata as { text?: string; source?: string; category?: string };
      console.log(
        `  score=${m.score?.toFixed(4)} source=${meta?.source} text=${(meta?.text ?? "").slice(0, 60)}...`
      );
    }
    if (!res.matches?.length) console.log("  (no matches)");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
