import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-zinc-200/90 bg-white px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-xs font-bold text-white">
            Z
          </span>
          <span className="text-sm font-medium text-zinc-700">
            ZUT Student Support
          </span>
        </div>
        <p className="max-w-sm text-center text-xs leading-relaxed text-zinc-500">
          AI answers are sourced from official ZUT documents. For urgent matters, contact the registrar.
        </p>
        <div className="flex gap-6 text-sm text-zinc-600">
          <Link href="#features" className="transition hover:text-emerald-700">
            Features
          </Link>
          <Link href="/sign-in" className="transition hover:text-emerald-700">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
