"use client";

import { useState, useRef, useEffect } from "react";
import { MessageBubble, TypingIndicator } from "./message-bubble";
import type { SourceCitation } from "@/lib/rag/types";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[];
};

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I am the ZUT Student Support assistant. Ask about admissions, fees, ID cards, registration, deadlines, or campus services.",
};

const STARTER_PROMPTS = [
  "How much is DIT tuition?",
  "When do applications close?",
  "How do I replace a lost ID?",
  "Registration deadlines this semester?",
];

type ChatWindowProps = {
  initialConversationId?: string;
  onConversationChange?: (id: string | undefined) => void;
};

export function ChatWindow({
  initialConversationId,
  onConversationChange,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  const showStarters =
    messages.length === 1 && messages[0]?.id === "welcome" && !loading;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!initialConversationId) {
      setMessages([WELCOME]);
      setConversationId(undefined);
      return;
    }

    let cancelled = false;
    setLoadingHistory(true);

    fetch(`/api/chat/conversations/${initialConversationId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load conversation");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const loaded: ChatMessage[] = data.conversation.messages.map(
          (m: {
            id: string;
            role: string;
            content: string;
            sources?: SourceCitation[];
          }) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            sources: m.sources as SourceCitation[] | undefined,
          })
        );
        setMessages(loaded.length > 0 ? loaded : [WELCOME]);
        setConversationId(initialConversationId);
      })
      .catch(() => {
        if (!cancelled) setMessages([WELCOME]);
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialConversationId]);

  async function sendMessage(text: string, escalate = false) {
    if (!text.trim() || loading || loadingHistory) return;
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: "user", content: text.trim() },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          conversationId,
          escalate,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        throw new Error("Your session expired. Please sign in again.");
      }
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      if (data.conversationId) {
        setConversationId(data.conversationId);
        onConversationChange?.(data.conversationId);
      }
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer,
          sources: data.sources,
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            e instanceof Error ? e.message : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-300/40 ring-1 ring-black/[0.03]">
      <div className="flex items-center gap-3 border-b border-zinc-100 bg-white px-4 py-3.5">
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white shadow-md">
          Z
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-zinc-900">ZUT Support Assistant</p>
          <p className="text-xs font-medium text-emerald-600">
            {loadingHistory ? "Loading conversation..." : "Online · Official documents"}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-zinc-50/80 p-4 sm:p-5">
        {loadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" />
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-zinc-100 bg-white p-4 sm:p-5">
        {showStarters && (
          <div className="mb-3 flex flex-wrap gap-2">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about fees, admissions, ID..."
            className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            disabled={loading || loadingHistory}
          />
          <button
            type="submit"
            disabled={loading || loadingHistory || !input.trim()}
            className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:opacity-50"
          >
            Send
          </button>
        </form>
        <button
          type="button"
          onClick={() =>
            sendMessage("I need to speak with a staff member", true)
          }
          disabled={loading || loadingHistory}
          className="mt-3 w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 text-sm font-medium text-zinc-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
        >
          Contact staff
        </button>
      </div>
    </div>
  );
}
