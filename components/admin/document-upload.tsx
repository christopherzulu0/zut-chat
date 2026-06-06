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
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setStatus(null);
    setError(false);
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
      setError(true);
      setStatus(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-700">
          PDF document
        </span>
        <div className="rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-6 text-center transition hover:border-emerald-300 hover:bg-emerald-50/30">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-800"
          />
          {file && (
            <p className="mt-2 text-xs text-emerald-700">
              Selected: {file.name}
            </p>
          )}
        </div>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-700">
          Category
        </span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={!file || loading}
        className="w-full rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:opacity-50"
      >
        {loading ? "Indexing..." : "Upload & index"}
      </button>

      {status && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}
        >
          {status}
        </p>
      )}
    </form>
  );
}
