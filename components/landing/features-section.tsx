import { SectionLabel } from "./section-label";

function IconGraduation() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  );
}

function IconWallet() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );
}

const FEATURES = [
  {
    title: "Admissions",
    description:
      "Entry requirements, application deadlines, and how to apply for diploma programmes.",
    Icon: IconGraduation,
    iconBg: "bg-blue-50 text-blue-700",
  },
  {
    title: "Fees & ID",
    description:
      "Tuition amounts, payment deadlines, and student ID replacement procedures.",
    Icon: IconWallet,
    iconBg: "bg-amber-50 text-amber-700",
  },
  {
    title: "Academic calendar",
    description:
      "Registration dates, exam periods, breaks, and semester timelines.",
    Icon: IconCalendar,
    iconBg: "bg-violet-50 text-violet-700",
  },
  {
    title: "24/7 web access",
    description:
      "Get answers anytime from your phone or laptop — no campus visit for routine FAQs.",
    Icon: IconGlobe,
    iconBg: "bg-emerald-50 text-emerald-700",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-[#fafafa] px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Topics covered</SectionLabel>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            What you can ask
          </h2>
          <p className="mt-4 text-zinc-600">
            Every answer is retrieved from official ZUT documents — not guessed from the open web.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ title, description, Icon, iconBg }) => (
            <div
              key={title}
              className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <div className={`inline-flex rounded-xl p-3 ${iconBg}`}>
                <Icon />
              </div>
              <h3 className="mt-4 font-semibold text-zinc-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
