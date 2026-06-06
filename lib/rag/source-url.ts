/** Markdown files served from data/knowledge via /sources/[filename] */
const VIEWABLE_KNOWLEDGE_FILES = new Set([
  "zut-faq.md",
  "academic-calendar-2026-2027.md",
]);

export function sourceBasename(source: string): string {
  const normalized = source.replace(/\\/g, "/");
  const slash = normalized.lastIndexOf("/");
  return slash === -1 ? normalized : normalized.slice(slash + 1);
}

export function resolveSourceViewerUrl(
  source: string,
  page?: number
): string | null {
  const name = sourceBasename(source);
  if (!VIEWABLE_KNOWLEDGE_FILES.has(name)) return null;
  const params = page ? `?page=${page}` : "";
  return `/sources/${encodeURIComponent(name)}${params}`;
}

export function isViewableKnowledgeSource(source: string): boolean {
  return VIEWABLE_KNOWLEDGE_FILES.has(sourceBasename(source));
}
