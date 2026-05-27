import { ChatWindow } from "@/components/chat/chat-window";

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">Student Support Chat</h1>
      <ChatWindow />
    </div>
  );
}
