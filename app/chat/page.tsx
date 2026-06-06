import { Suspense } from "react";
import { ChatWindow } from "@/components/chat/chat-window";
import { AdminAccessDeniedBanner } from "@/components/auth/admin-access-denied-banner";
import { AdminDashboardLink } from "@/components/admin/admin-dashboard-link";
import { LandingGrid, LandingOrb } from "@/components/landing/landing-decor";
import { getAuthContext } from "@/lib/auth";

export default async function ChatPage() {
  const { isAdmin } = await getAuthContext();

  return (
    <div className="chat-page relative flex min-h-[calc(100vh-3.75rem)] flex-col overflow-hidden bg-gradient-to-b from-white via-emerald-50/40 to-[#fafafa]">
      <LandingGrid />
      <LandingOrb className="-left-24 top-8 h-72 w-72 bg-emerald-300/20" />
      <LandingOrb className="-right-24 bottom-24 h-64 w-64 bg-teal-300/15" />

      <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-5 sm:py-8">
        <div className="mb-5 shrink-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
                Student support
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Chat with ZUT Assistant
              </h1>
              <p className="mt-1.5 text-sm text-zinc-600">
                Answers are sourced from official university documents.
              </p>
            </div>
            {isAdmin && <AdminDashboardLink />}
          </div>
        </div>

        <Suspense fallback={null}>
          <AdminAccessDeniedBanner />
        </Suspense>

        <div className="mt-4 flex min-h-0 flex-1 flex-col pb-4">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}
