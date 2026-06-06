import { SignInAuthButton, SignUpAuthButton } from "@/components/auth/auth-buttons";

export function CtaSection() {
  return (
    <section className="bg-[#fafafa] px-4 py-20">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50/80 p-10 shadow-sm sm:p-14">
        <div className="pointer-events-none absolute inset-0 hidden" />

        <div className="relative text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-xl font-bold text-white shadow-lg shadow-emerald-700/25">
            Z
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Ready to get answers?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-zinc-600">
            Join ZUT students using AI-powered support grounded in official university documents.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <SignUpAuthButton className="rounded-full bg-emerald-700 px-10 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800">
              Create free account
            </SignUpAuthButton>
            <SignInAuthButton className="rounded-full border border-zinc-300 bg-white px-10 py-3.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700">
              Sign in
            </SignInAuthButton>
          </div>
        </div>
      </div>
    </section>
  );
}
