"use client";

import { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./message-bubble";
import type { SourceCitation } from "@/lib/rag/types";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[];
};

type ChatWindowProps = {
  isGuest?: boolean;
};

export function ChatWindow({ isGuest = false }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am the ZUT Student Support assistant. Ask about admissions, fees, ID cards, registration, deadlines, or campus services.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string, escalate = false) {
    if (!text.trim() || loading) return;
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
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      if (data.conversationId) setConversationId(data.conversationId);
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
    <div className="flex h-full min-h-[480px] flex-col rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {loading && (
          <p className="animate-pulse text-sm text-zinc-500">Thinking...</p>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        {isGuest && (
          <p className="mb-2 text-xs text-zinc-500">
            Guest mode: limited queries. Sign in for full access.
          </p>
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
            className="flex-1 rounded-xl border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            Send
          </button>
        </form>
        <button
          type="button"
          onClick={() =>
            sendMessage("I need to speak with a staff member", true)
          }
          className="mt-2 w-full text-center text-xs text-emerald-700 hover:underline"
        >
          Contact staff
        </button>
      </div>
    </div>
  );
}
