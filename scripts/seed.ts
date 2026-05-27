import { loadProjectEnv } from "../lib/env/load-env";

console.log("[seed] Starting ZUT knowledge base seed...");
loadProjectEnv();

function requireEnvVars(): void {
  const required = ["OPENAI_API_KEY", "PINECONE_API_KEY", "PINECONE_INDEX"] as const;
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    console.error(`[seed] Missing environment variables: ${missing.join(", ")}`);
    console.error("[seed] Copy .env.example to .env or .env.local and add your keys.");
    process.exit(1);
  }

  console.log("[seed] Environment OK (OpenAI + Pinecone keys present).");

  if (process.env.PINECONE_HOST?.trim()) {
    console.log("[seed] PINECONE_HOST is set — skipping api.pinecone.io lookup.");
  } else {
    console.warn(
      "[seed] PINECONE_HOST is not set. Seed will call api.pinecone.io to resolve your index host."
    );
    console.warn(
      "[seed] If you see connect timeouts, copy the index host from the Pinecone console into PINECONE_HOST."
    );
  }
}

async function main() {
  requireEnvVars();

  const { seedKnowledgeBase } = await import("../lib/rag/ingest");

  console.log(
    "[seed] Embedding documents and upserting to Pinecone (may take several minutes on slow networks)..."
  );

  const chunks = await seedKnowledgeBase();
  console.log(`[seed] Done. Seeded ${chunks} chunks into index "${process.env.PINECONE_INDEX}".`);
}

function printSparseIndexHelp(message: string): void {
  if (!message.includes("sparse index")) {
    return;
  }
  console.error(`
[seed] Wrong Pinecone index type
  Your index "${process.env.PINECONE_INDEX}" is a SPARSE index.
  This app stores dense vectors from OpenAI embeddings (768 dimensions).

  In https://app.pinecone.io create a new serverless index:
    - Vector type: Dense (standard) — not sparse
    - Dimensions: 768
    - Metric: cosine

  Update .env with the new index name and host, then run: pnpm seed
`);
}

main().catch((error: unknown) => {
  console.error("[seed] Failed:");
  const message =
    error instanceof Error ? error.message : String(error);
  console.error(message);
  printSparseIndexHelp(message);
  if (error instanceof Error && error.cause) {
    console.error("Cause:", error.cause);
  }
  process.exit(1);
});
