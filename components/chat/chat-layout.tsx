"use client";

import { useState } from "react";
import { ChatWindow } from "@/components/chat/chat-window";
import { ChatHistorySidebar } from "@/components/chat/chat-history-sidebar";

export function ChatLayout() {
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [chatKey, setChatKey] = useState(0);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  function handleNewChat() {
    setConversationId(undefined);
    setChatKey((k) => k + 1);
  }

  function handleConversationChange(id: string | undefined) {
    setConversationId(id);
    if (id) {
      setHistoryRefresh((r) => r + 1);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <ChatHistorySidebar
        activeId={conversationId}
        onSelect={setConversationId}
        onNewChat={handleNewChat}
        refreshKey={historyRefresh}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ChatWindow
          key={`${chatKey}-${conversationId ?? "new"}`}
          initialConversationId={conversationId}
          onConversationChange={handleConversationChange}
        />
      </div>
    </div>
  );
}
