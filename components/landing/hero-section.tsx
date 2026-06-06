import { SignInAuthButton, SignUpAuthButton } from "@/components/auth/auth-buttons";
import { ChatPreview } from "./chat-preview";
import { LandingGrid, LandingOrb } from "./landing-decor";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/50 to-[#fafafa]">
      <LandingGrid />
      <LandingOrb className="-left-32 top-0 h-96 w-96 bg-emerald-300/25" />
      <LandingOrb className="-right-32 top-24 h-80 w-80 bg-teal-300/15" />

      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-12 sm:pb-20 sm:pt-16 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-1.5 text-sm font-medium text-emerald-800 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Zambia University of Technology
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Your campus questions,{" "}
              <span className="bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                answered instantly
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-zinc-600">
              The ZUT Student Support assistant searches official handbooks,
              calendars, and FAQs — then cites the source with every answer.
            </p>

            <ul className="mt-6 hidden space-y-2.5 text-left text-sm text-zinc-600 lg:block">
              {[
                "Admissions, fees, and ID card queries",
                "Semester registration and exam dates",
                "Escalate to staff when you need a human",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                    <svg
                      className="h-3 w-3 text-emerald-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <SignUpAuthButton className="rounded-full bg-emerald-700 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800">
                Get started free
              </SignUpAuthButton>
              <SignInAuthButton className="rounded-full border border-zinc-300 bg-white px-8 py-3.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700">
                Sign in
              </SignInAuthButton>
            </div>

            <p className="mt-4 text-xs text-zinc-500">
              Free for students · Sign in required to chat
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-emerald-200/40 via-transparent to-teal-200/30 blur-2xl" />
            <ChatPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
