import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isViewableKnowledgeSource, sourceBasename } from "@/lib/rag/source-url";

type PageProps = {
  params: Promise<{ filename: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function loadSource(filename: string): Promise<string> {
  const name = sourceBasename(decodeURIComponent(filename));
  if (!isViewableKnowledgeSource(name)) notFound();

  const filePath = path.join(process.cwd(), "data", "knowledge", name);
  try {
    return await readFile(filePath, "utf-8");
  } catch {
    notFound();
  }
}

export default async function SourceViewerPage({ params, searchParams }: PageProps) {
  const { filename } = await params;
  const { page } = await searchParams;
  const name = sourceBasename(decodeURIComponent(filename));
  const content = await loadSource(filename);
  const pageNum = page ? Number.parseInt(page, 10) : undefined;

  return (
    <div className="chat-page min-h-[calc(100vh-3.75rem)] bg-gradient-to-b from-white via-emerald-50/40 to-[#fafafa] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/chat"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Back to chat
        </Link>

        <header className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
            Source document
          </p>
          <h1 className="mt-1 text-xl font-bold text-zinc-900">{name}</h1>
          {pageNum && Number.isFinite(pageNum) && (
            <p className="mt-1 text-sm text-zinc-600">
              Referenced section: page {pageNum}
            </p>
          )}
        </header>

        <article className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-800">
            {content}
          </pre>
        </article>
      </div>
    </div>
  );
}
