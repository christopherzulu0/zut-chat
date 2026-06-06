/** Stable hash for query logging (no PII stored). */
export function hashQuery(query: string): string {
  let h = 0;
  for (let i = 0; i < query.length; i++) {
    h = (h << 5) - h + query.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}
