export type SourceCitation = {
  source: string;
  page?: number;
  category?: string;
  text?: string;
};

export type RagResult = {
  answer: string;
  sources: SourceCitation[];
  confidence: number;
  shouldEscalate: boolean;
  latencyMs: number;
};

export type ChunkMetadata = {
  text: string;
  source: string;
  page?: number;
  category?: string;
  timestamp?: string;
};
