"use client";

import { useCallback, useEffect, useState } from "react";

type ConversationSummary = {
  id: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
};

type ChatHistorySidebarProps = {
  activeId?: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  refreshKey?: number;
};

const PAGE_SIZE = 5;

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "short" });
}

export function ChatHistorySidebar({
  activeId,
  onSelect,
  onNewChat,
  refreshKey = 0,
}: ChatHistorySidebarProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchPage = useCallback(async (offset: number) => {
    const res = await fetch(
      `/api/chat/conversations?limit=${PAGE_SIZE}&offset=${offset}`
    );
    if (!res.ok) return null;
    return res.json() as Promise<{
      conversations: ConversationSummary[];
      hasMore: boolean;
      total: number;
    }>;
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPage(0);
      if (!data) return;
      setConversations(data.conversations ?? []);
      setHasMore(data.hasMore ?? false);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchPage(conversations.length);
      if (!data) return;
      setConversations((prev) => [...prev, ...(data.conversations ?? [])]);
      setHasMore(data.hasMore ?? false);
      setTotal(data.total ?? 0);
    } finally {
      setLoadingMore(false);
    }
  }, [conversations.length, fetchPage, hasMore, loadingMore]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial, refreshKey]);

  return (
    <aside className="hidden w-64 shrink-0 flex-col rounded-2xl border border-zinc-200 bg-white shadow-lg shadow-zinc-200/40 lg:flex">
      <div className="border-b border-zinc-100 p-3">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          New chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading && conversations.length === 0 ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-zinc-100" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-zinc-400">
            Past chats appear here after you send a message.
          </p>
        ) : (
          <>
            <ul className="space-y-1">
              {conversations.map((c) => {
                const active = c.id === activeId;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(c.id)}
                      className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                        active
                          ? "bg-emerald-50 ring-1 ring-emerald-200"
                          : "hover:bg-zinc-50"
                      }`}
                    >
                      <p
                        className={`truncate text-sm font-medium ${
                          active ? "text-emerald-900" : "text-zinc-800"
                        }`}
                      >
                        {c.preview}
                      </p>
                      <p className="mt-0.5 text-[11px] text-zinc-400">
                        {formatRelative(c.updatedAt)} · {c.messageCount} msg
                        {c.messageCount === 1 ? "" : "s"}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
            {hasMore && (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
              >
                {loadingMore
                  ? "Loading..."
                  : `Load more (${conversations.length} of ${total})`}
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
