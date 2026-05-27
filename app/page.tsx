import Link from "next/link";
import { ChatWindow } from "@/components/chat/chat-window";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          ZUT Student Support
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Get instant answers about admissions, fees, ID cards, registration, and
          deadlines — 24/7 on web or USSD for basic phones.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/chat"
            className="rounded-full bg-emerald-700 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Open full chat
          </Link>
          <span className="rounded-full border px-6 py-2 text-sm text-zinc-600">
            USSD: dial your campus short code
          </span>
        </div>
      </section>
      <div className="mx-auto max-w-3xl">
        <ChatWindow isGuest />
      </div>
    </div>
  );
}
