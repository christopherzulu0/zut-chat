"use client";

import { SourceCitation } from "./source-citation";
import type { SourceCitation as SourceCitationType } from "@/lib/rag/types";

type MessageBubbleProps = {
  message: {
    role: "user" | "assistant";
    content: string;
    sources?: SourceCitationType[];
  };
};

function Avatar({ role }: { role: "user" | "assistant" }) {
  if (role === "assistant") {
    return (
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white shadow-sm">
        Z
      </span>
    );
  }
  return (
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-800">
      You
    </span>
  );
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <Avatar role={message.role} />
      <div
        className={`max-w-[min(85%,32rem)] px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-2xl rounded-br-md bg-emerald-700 text-white shadow-sm"
            : "rounded-2xl rounded-bl-md border border-zinc-200/80 bg-white text-zinc-900 shadow-sm"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceCitation sources={message.sources} />
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white shadow-sm">
        Z
      </span>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-zinc-200/80 bg-white px-4 py-3 shadow-sm">
        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export { TypingIndicator };
