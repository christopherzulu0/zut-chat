"use client";

import { useState } from "react";
import type { SourceCitation as SourceCitationType } from "@/lib/rag/types";
import { resolveSourceViewerUrl } from "@/lib/rag/source-url";

function SourceChip({ source }: { source: SourceCitationType }) {
  const [showExcerpt, setShowExcerpt] = useState(false);
  const href = resolveSourceViewerUrl(source.source, source.page);
  const label = `${source.source}${source.page ? ` p.${source.page}` : ""}`;
  const chipClass =
    "rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100 hover:text-emerald-900";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={source.category ? `Category: ${source.category}` : undefined}
        className={`${chipClass} cursor-pointer underline-offset-2 hover:underline`}
      >
        {label}
      </a>
    );
  }

  return (
    <span className="inline-flex max-w-full flex-col gap-1">
      <button
        type="button"
        onClick={() => setShowExcerpt((open) => !open)}
        title={
          source.text
            ? "Click to view excerpt"
            : source.category
              ? `Category: ${source.category}`
              : undefined
        }
        className={`${chipClass} cursor-pointer text-left`}
      >
        {label}
        {source.text ? (showExcerpt ? " ↑" : " ↓") : null}
      </button>
      {showExcerpt && source.text && (
        <span className="block max-w-md rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-xs leading-relaxed text-zinc-600">
          {source.text}
          {source.text.length >= 200 ? "…" : ""}
        </span>
      )}
    </span>
  );
}

export function SourceCitation({ sources }: { sources: SourceCitationType[] }) {
  const [open, setOpen] = useState(false);

  if (!sources.length) return null;

  return (
    <div className="mt-2 border-t border-zinc-200/60 pt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs font-medium text-emerald-700 hover:underline"
      >
        {open ? "Hide" : "Show"} sources ({sources.length})
      </button>
      {open && (
        <div className="mt-2 flex flex-wrap items-start gap-1.5">
          {sources.map((s, i) => (
            <SourceChip key={`${s.source}-${s.page ?? "np"}-${i}`} source={s} />
          ))}
        </div>
      )}
    </div>
  );
}
