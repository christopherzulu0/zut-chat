"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCard, EmptyState, StatusBadge } from "@/components/admin/admin-shell";

type Message = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

type Escalation = {
  id: string;
  contact: string;
  userName: string | null;
  userEmail: string | null;
  summary: string;
  status: string;
  channel: string;
  conversationId: string | null;
  createdAt: string;
  conversation?: {
    id: string;
    userId: string | null;
    messages: Message[];
  } | null;
};

type EscalationCounts = {
  open: number;
  in_progress: number;
  resolved: number;
  total: number;
};

type StatusFilter = "all" | "open" | "in_progress" | "resolved";

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "resolved", label: "Resolved" },
];

const STATUS_ACTIONS: Record<
  string,
  { label: string; next: "open" | "in_progress" | "resolved" }[]
> = {
  open: [
    { label: "Start working", next: "in_progress" },
    { label: "Resolve", next: "resolved" },
  ],
  in_progress: [
    { label: "Resolve", next: "resolved" },
    { label: "Reopen", next: "open" },
  ],
  resolved: [{ label: "Reopen", next: "open" }],
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function EscalationCard({
  escalation,
  onStatusChange,
  updating,
}: {
  escalation: Escalation;
  onStatusChange: (id: string, status: "open" | "in_progress" | "resolved") => void;
  updating: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = escalation.id.slice(0, 8).toUpperCase();
  const messages = escalation.conversation?.messages ?? [];
  const actions = STATUS_ACTIONS[escalation.status] ?? [];

  async function copyRef() {
    await navigator.clipboard.writeText(escalation.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <li className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold text-zinc-900">
                #{ref}
              </span>
              <StatusBadge status={escalation.status} />
              <span className="text-xs text-zinc-400" title={formatDate(escalation.createdAt)}>
                {relativeTime(escalation.createdAt)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-800">
              {escalation.summary}
            </p>
            <div className="mt-3 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Student
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">
                {escalation.userName ?? "Unknown name"}
              </p>
              {escalation.userEmail ? (
                <a
                  href={`mailto:${escalation.userEmail}`}
                  className="mt-0.5 block text-sm text-emerald-700 hover:underline"
                >
                  {escalation.userEmail}
                </a>
              ) : (
                <p className="mt-0.5 text-sm text-zinc-400">No email on file</p>
              )}
              <p className="mt-1.5 text-xs text-zinc-400">
                ID: <span className="font-mono">{escalation.contact}</span>
                {messages.length > 0 && (
                  <span> · {messages.length} message{messages.length === 1 ? "" : "s"} in thread</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={copyRef}
              className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
            >
              {copied ? "Copied!" : "Copy ID"}
            </button>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
              >
                {expanded ? "Hide chat" : "View chat"}
              </button>
            )}
          </div>
        </div>

        {actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
            {actions.map((action) => (
              <button
                key={action.next}
                type="button"
                disabled={updating === escalation.id}
                onClick={() => onStatusChange(escalation.id, action.next)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                  action.next === "resolved"
                    ? "bg-emerald-700 text-white hover:bg-emerald-800"
                    : action.next === "in_progress"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {updating === escalation.id ? "Updating..." : action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {expanded && messages.length > 0 && (
        <div className="border-t border-zinc-100 bg-zinc-50/80 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Conversation context
          </p>
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "ml-4 bg-emerald-700 text-white"
                    : "mr-4 border border-zinc-200 bg-white text-zinc-800"
                }`}
              >
                <span className="mb-0.5 block text-[10px] font-semibold uppercase opacity-70">
                  {msg.role}
                </span>
                {msg.content}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export function EscalationsPanel() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [counts, setCounts] = useState<EscalationCounts>({
    open: 0,
    in_progress: 0,
    resolved: 0,
    total: 0,
  });
  const [filter, setFilter] = useState<StatusFilter>("open");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/escalations?status=${filter}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setEscalations(data.escalations ?? []);
      setCounts(data.counts ?? { open: 0, in_progress: 0, resolved: 0, total: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load escalations");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(
    id: string,
    status: "open" | "in_progress" | "resolved"
  ) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/escalations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdating(null);
    }
  }

  const openNeedsAttention = counts.open > 0;

  return (
    <AdminCard
      title="Student escalations"
      description="Review staff handoff requests from chat. Update status as you work each ticket."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count =
              f.key === "all"
                ? counts.total
                : counts[f.key as keyof EscalationCounts] ?? 0;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:border-emerald-300 hover:text-emerald-700"
                }`}
              >
                {f.label}
                <span className={`ml-1.5 ${active ? "text-emerald-200" : "text-zinc-400"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {openNeedsAttention && filter !== "resolved" && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>{counts.open}</strong> open ticket{counts.open === 1 ? "" : "s"} waiting for staff response.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && escalations.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-zinc-100" />
          ))}
        </div>
      ) : escalations.length === 0 ? (
        <EmptyState
          message={
            filter === "all"
              ? "No escalations yet. Students can request staff help from the chat page."
              : `No ${filter.replace("_", " ")} escalations.`
          }
        />
      ) : (
        <ul className="space-y-3">
          {escalations.map((e) => (
            <EscalationCard
              key={e.id}
              escalation={e}
              onStatusChange={handleStatusChange}
              updating={updating}
            />
          ))}
        </ul>
      )}
    </AdminCard>
  );
}
