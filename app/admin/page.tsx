"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AdminCard,
  AdminShell,
  EmptyState,
  StatusBadge,
} from "@/components/admin/admin-shell";
import { DocumentUpload } from "@/components/admin/document-upload";
import { EscalationsPanel } from "@/components/admin/escalations-panel";
import { MetricsCards } from "@/components/admin/metrics-cards";

type Doc = {
  id: string;
  filename: string;
  category: string;
  chunkCount: number | null;
  status: string;
  indexedAt: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminPage() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const loadDocuments = useCallback(() => {
    fetch("/api/admin/documents")
      .then((r) => r.json())
      .then((d) => setDocuments(d.documents ?? []));
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function seedKnowledge() {
    setSeeding(true);
    setSeedStatus("Seeding knowledge base...");
    const res = await fetch("/api/seed", { method: "POST" });
    const data = await res.json();
    setSeedStatus(
      res.ok ? `Seeded ${data.chunks} chunks successfully` : data.error ?? "Seed failed"
    );
    setSeeding(false);
    loadDocuments();
  }

  return (
    <AdminShell
      title="Admin Dashboard"
      description="Manage the knowledge base, monitor usage, and review student escalations."
      actions={
        <>
          <Link
            href="/chat"
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700"
          >
            Open chat
          </Link>
          <button
            type="button"
            onClick={seedKnowledge}
            disabled={seeding}
            className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:opacity-50"
          >
            {seeding ? "Seeding..." : "Seed knowledge base"}
          </button>
        </>
      }
    >
      {seedStatus && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {seedStatus}
        </div>
      )}

      <MetricsCards />

      <EscalationsPanel />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard
          title="Upload document"
          description="Add a PDF to the knowledge base. It will be chunked and indexed in Pinecone."
        >
          <DocumentUpload onUploaded={loadDocuments} />
        </AdminCard>

        <AdminCard
          title="Quick tips"
          description="Keep the assistant accurate with up-to-date official documents."
        >
          <ul className="space-y-3 text-sm text-zinc-600">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                1
              </span>
              Run <strong className="text-zinc-800">Seed knowledge base</strong> after first setup or when switching embedding models.
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                2
              </span>
              Upload PDFs by category so retrieval filters work correctly.
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                3
              </span>
              Markdown files in <code className="rounded bg-zinc-100 px-1">data/knowledge/</code> are included when seeding.
            </li>
          </ul>
        </AdminCard>
      </div>

      <AdminCard
        title="Indexed documents"
        description={`${documents.length} document${documents.length === 1 ? "" : "s"} in the database`}
      >
        {documents.length === 0 ? (
          <EmptyState message="No uploaded documents yet. Seed the knowledge base or upload a PDF above." />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {documents.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-900">
                    {d.filename}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500 capitalize">
                    {d.category}
                    {d.indexedAt && ` · ${formatDate(d.indexedAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-500">
                    {d.chunkCount ?? 0} chunks
                  </span>
                  <StatusBadge status={d.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </AdminShell>
  );
}
