/**
 * Wipe all vectors in the default namespace and re-seed with current OpenAI embeddings.
 * Use after switching from Gemini or changing OPENAI_EMBEDDING_* settings.
 */
import { loadProjectEnv } from "../lib/env/load-env";

console.log("[seed:reset] Clearing Pinecone and re-seeding...");
loadProjectEnv();

async function main() {
  const required = ["OPENAI_API_KEY", "PINECONE_API_KEY", "PINECONE_INDEX"] as const;
  const missing = required.filter((k) => !process.env[k]?.trim());
  if (missing.length) {
    console.error(`Missing: ${missing.join(", ")}`);
    process.exit(1);
  }

  const { getPineconeIndex } = await import("../lib/rag/pinecone");
  const { seedKnowledgeBase } = await import("../lib/rag/ingest");
  const { checkRetrievalHealth } = await import("../lib/rag/verify-retrieval");
  const { OPENAI_EMBEDDING_DIMENSION, OPENAI_EMBEDDING_MODEL } = await import(
    "../lib/ai/config"
  );

  console.log(
    `[seed:reset] Embedding model: ${OPENAI_EMBEDDING_MODEL}, dimension: ${OPENAI_EMBEDDING_DIMENSION}`
  );

  const index = getPineconeIndex();
  const statsBefore = await index.describeIndexStats();
  console.log(
    `[seed:reset] Before: ${statsBefore.totalRecordCount ?? 0} vectors (index dim ${statsBefore.dimension ?? "?"})`
  );

  console.log("[seed:reset] Deleting all vectors in default namespace...");
  await index.deleteAll();

  const chunks = await seedKnowledgeBase();
  console.log(`[seed:reset] Upserted ${chunks} chunks.`);

  console.log("[seed:reset] Verifying retrieval...");
  const health = await checkRetrievalHealth();
  console.log(`[seed:reset] ${health.message}`);

  if (!health.ok) {
    process.exit(1);
  }

  console.log("[seed:reset] Done. Restart dev server and try chat again.");
}

main().catch((e) => {
  console.error("[seed:reset] Failed:", e);
  process.exit(1);
});
