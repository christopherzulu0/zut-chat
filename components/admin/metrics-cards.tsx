"use client";

import { useEffect, useState } from "react";

type Metrics = {
  stats: {
    totalQueries: number;
    avgLatency: number;
    escalationCount: number;
  };
};

export function MetricsCards() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => r.json())
      .then(setMetrics)
      .catch(console.error);
  }, []);

  const s = metrics?.stats;
  const cards = [
    { label: "Total queries", value: s?.totalQueries ?? 0 },
    { label: "Avg latency (ms)", value: s?.avgLatency ?? 0 },
    { label: "Escalations", value: s?.escalationCount ?? 0 },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border bg-white p-4 dark:bg-zinc-950"
        >
          <p className="text-sm text-zinc-500">{c.label}</p>
          <p className="text-2xl font-semibold">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
