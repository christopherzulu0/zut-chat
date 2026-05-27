import { Pinecone } from "@pinecone-database/pinecone";
import type { Index } from "@pinecone-database/pinecone";

let pineconeClient: Pinecone | null = null;

export function getPinecone(): Pinecone {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is not set");
  }
  if (!pineconeClient) {
    pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  }
  return pineconeClient;
}

export function getIndexName(): string {
  return process.env.PINECONE_INDEX ?? "zut-student-support";
}

/**
 * Returns a Pinecone data index. Set PINECONE_HOST (from the Pinecone console)
 * to skip the control-plane describeIndex call to api.pinecone.io — useful when
 * that endpoint is blocked or slow on your network.
 */
export function getPineconeIndex(): Index {
  const pc = getPinecone();
  const name = getIndexName();
  const host = process.env.PINECONE_HOST?.trim();

  if (host) {
    return pc.index({ name, host });
  }
  return pc.index(name);
}

export function isPineconeConfigured(): boolean {
  return Boolean(process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX);
}
