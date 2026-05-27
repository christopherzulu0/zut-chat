type Source = { source: string; page?: number; category?: string };

export function SourceCitation({ sources }: { sources: Source[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1 border-t border-zinc-200/50 pt-2 dark:border-zinc-600/50">
      {sources.map((s, i) => (
        <span
          key={`${s.source}-${i}`}
          className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
        >
          {s.source}
          {s.page ? ` p.${s.page}` : ""}
        </span>
      ))}
    </div>
  );
}
