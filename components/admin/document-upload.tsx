"use client";

import { useState } from "react";

const CATEGORIES = [
  "admissions",
  "fees",
  "id",
  "registration",
  "deadlines",
  "campus",
  "general",
];

export function DocumentUpload({ onUploaded }: { onUploaded?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("general");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setStatus(null);
    const form = new FormData();
    form.append("file", file);
    form.append("category", category);
    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setStatus(`Indexed ${data.chunkCount} chunks from ${file.name}`);
      setFile(null);
      onUploaded?.();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border p-4">
      <h3 className="font-medium">Upload knowledge document (PDF)</h3>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-900"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={!file || loading}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Indexing..." : "Upload & index"}
      </button>
      {status && <p className="text-sm text-zinc-600">{status}</p>}
    </form>
  );
}
