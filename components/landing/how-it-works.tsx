import { SectionLabel } from "./section-label";

const STEPS = [
  {
    step: "01",
    title: "Create your account",
    description: "Sign up with your email — it takes less than a minute.",
  },
  {
    step: "02",
    title: "Ask anything",
    description: "Type naturally about fees, deadlines, registration, or campus services.",
  },
  {
    step: "03",
    title: "Get cited answers",
    description: "See which official document each answer came from. Escalate to staff anytime.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-zinc-200/90 bg-white px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <SectionLabel>Simple process</SectionLabel>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            How it works
          </h2>
        </div>

        <div className="relative mt-14">
          <div
            className="absolute left-[16.67%] right-[16.67%] top-8 hidden h-px bg-gradient-to-r from-emerald-100 via-emerald-300 to-emerald-100 md:block"
            aria-hidden
          />

          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-lg font-bold text-emerald-800 shadow-sm">
                  {s.step}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-zinc-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
