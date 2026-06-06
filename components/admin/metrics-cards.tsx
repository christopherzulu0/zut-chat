"use client";

import { useEffect, useState } from "react";

type Metrics = {
  stats: {
    totalQueries: number;
    avgLatency: number;
    escalationCount: number;
  };
};

const METRIC_CONFIG = [
  {
    label: "Total queries",
    key: "totalQueries" as const,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    accent: "bg-blue-50 text-blue-700",
  },
  {
    label: "Avg latency",
    key: "avgLatency" as const,
    suffix: "ms",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: "bg-violet-50 text-violet-700",
  },
  {
    label: "Escalations",
    key: "escalationCount" as const,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    accent: "bg-amber-50 text-amber-700",
  },
];

export function MetricsCards() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => r.json())
      .then(setMetrics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const s = metrics?.stats;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {METRIC_CONFIG.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm ring-1 ring-black/[0.03]"
        >
          <div className="flex items-start justify-between">
            <div className={`rounded-xl p-2.5 ${c.accent}`}>{c.icon}</div>
          </div>
          <p className="mt-4 text-sm font-medium text-zinc-500">{c.label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
            {loading ? (
              <span className="inline-block h-8 w-16 animate-pulse rounded bg-zinc-100" />
            ) : (
              <>
                {s?.[c.key] ?? 0}
                {c.suffix && (
                  <span className="ml-1 text-base font-medium text-zinc-400">
                    {c.suffix}
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
