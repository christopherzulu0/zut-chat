import "dotenv/config";
import { runRagQuery } from "../lib/rag/chain";
import { BENCHMARK_QUERIES } from "./benchmark-queries";

const QUERIES = BENCHMARK_QUERIES;

async function main() {
  const latencies: number[] = [];
  let correct = 0;

  for (const q of QUERIES) {
    const start = Date.now();
    const result = await runRagQuery(q);
    latencies.push(Date.now() - start);
    const ok = !result.shouldEscalate && result.answer.length > 20;
    if (ok) correct++;
    console.log(`Q: ${q}\nA: ${result.answer.slice(0, 120)}...\n`);
  }

  latencies.sort((a, b) => a - b);
  const p95 = latencies[Math.floor(latencies.length * 0.95)] ?? 0;
  console.log(`Accuracy proxy: ${correct}/${QUERIES.length}`);
  console.log(`P95 latency: ${p95}ms`);
}

main().catch(console.error);
