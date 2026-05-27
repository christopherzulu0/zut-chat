"use client";

import { useCallback, useEffect, useState } from "react";
import { DocumentUpload } from "@/components/admin/document-upload";
import { MetricsCards } from "@/components/admin/metrics-cards";

type Doc = {
  id: string;
  filename: string;
  category: string;
  chunkCount: number | null;
  status: string;
  indexedAt: string | null;
};

type Escalation = {
  id: string;
  contact: string;
  summary: string;
  status: string;
  channel: string;
  createdAt: string;
};

export default function AdminPage() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/documents")
      .then((r) => r.json())
      .then((d) => setDocuments(d.documents ?? []));
    fetch("/api/admin/escalations")
      .then((r) => r.json())
      .then((d) => setEscalations(d.escalations ?? []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function seedKnowledge() {
    setSeedStatus("Seeding...");
    const res = await fetch("/api/seed", { method: "POST" });
    const data = await res.json();
    setSeedStatus(
      res.ok ? `Seeded ${data.chunks} chunks` : data.error ?? "Failed"
    );
    load();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <button
          onClick={seedKnowledge}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          Seed sample knowledge base
        </button>
      </div>
      {seedStatus && <p className="text-sm text-zinc-600">{seedStatus}</p>}

      <MetricsCards />

      <DocumentUpload onUploaded={load} />

      <section>
        <h2 className="mb-3 font-medium">Indexed documents</h2>
        <ul className="divide-y rounded-xl border">
          {documents.length === 0 ? (
            <li className="p-4 text-sm text-zinc-500">No documents yet</li>
          ) : (
            documents.map((d) => (
              <li key={d.id} className="flex justify-between p-4 text-sm">
                <span>
                  {d.filename} ({d.category})
                </span>
                <span className="text-zinc-500">
                  {d.chunkCount} chunks · {d.status}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 font-medium">Escalations</h2>
        <ul className="divide-y rounded-xl border">
          {escalations.length === 0 ? (
            <li className="p-4 text-sm text-zinc-500">No escalations</li>
          ) : (
            escalations.map((e) => (
              <li key={e.id} className="p-4 text-sm">
                <p className="font-medium">
                  {e.id.slice(0, 8)} · {e.channel} · {e.status}
                </p>
                <p className="text-zinc-500">{e.contact}</p>
                <p className="mt-1">{e.summary}</p>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
