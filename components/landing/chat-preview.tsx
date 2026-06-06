import { SignUpAuthButton } from "@/components/auth/auth-buttons";

const MOCK_MESSAGES = [
  {
    role: "user" as const,
    content: "How much is tuition for Diploma in IT?",
  },
  {
    role: "assistant" as const,
    content:
      "Tuition for the Diploma in Information Technology (DIT) at ZUT is K7,445.00 per semester. Payment is due before registration.",
    source: "ZUT_Fees_Handbook_2026.pdf",
  },
  {
    role: "user" as const,
    content: "When do applications close?",
  },
  {
    role: "assistant" as const,
    content: "Applications for the 2026 intake close on 30th November 2026.",
    source: "ZUT_Admissions_2026.pdf",
  },
];

export function ChatPreview() {
  return (
    <div className="relative lg:rotate-1 lg:transition-transform lg:hover:rotate-0">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-300/40 ring-1 ring-black/[0.03]">
        <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/80 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
          <span className="ml-2 flex-1 rounded-md border border-zinc-200/80 bg-white px-3 py-0.5 text-center text-[10px] text-zinc-400">
            zut.ac.zm/chat
          </span>
        </div>

        <div className="flex items-center gap-3 border-b border-zinc-100 bg-white px-4 py-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white shadow-md">
            Z
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              ZUT Support Assistant
            </p>
            <p className="text-xs font-medium text-emerald-600">
              Online · Official documents
            </p>
          </div>
        </div>

        <div className="space-y-3 bg-zinc-50/80 p-4">
          {MOCK_MESSAGES.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start gap-2"}`}
            >
              {msg.role === "assistant" && (
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-bold text-white">
                  Z
                </span>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-br-md bg-emerald-700 text-white shadow-sm"
                    : "rounded-bl-md border border-zinc-200/80 bg-white text-zinc-900 shadow-sm"
                }`}
              >
                <p>{msg.content}</p>
                {msg.role === "assistant" && msg.source && (
                  <span className="mt-2 inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                    {msg.source}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-100 bg-white p-3">
          <div className="flex gap-2 opacity-50">
            <div className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-400">
              Ask about fees, admissions, ID...
            </div>
            <div className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white">
              Send
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-end justify-center pb-8 sm:items-center sm:pb-0">
        <div className="mx-4 w-full max-w-xs rounded-2xl border border-zinc-200/80 bg-white/95 p-5 text-center shadow-xl backdrop-blur-sm">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-zinc-900">
            Sign in to start chatting
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Preview only — create a free account for real answers
          </p>
          <SignUpAuthButton className="mt-4 w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800">
            Create free account
          </SignUpAuthButton>
        </div>
      </div>
    </div>
  );
}
