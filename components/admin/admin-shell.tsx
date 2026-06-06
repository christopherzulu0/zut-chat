import Link from "next/link";
import { LandingGrid, LandingOrb } from "@/components/landing/landing-decor";
import { SectionLabel } from "@/components/landing/section-label";

type AdminShellProps = {
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function AdminShell({
  title,
  description,
  actions,
  children,
}: AdminShellProps) {
  return (
    <div className="admin-page relative min-h-[calc(100vh-3.75rem)] overflow-hidden bg-gradient-to-b from-white via-emerald-50/40 to-[#fafafa]">
      <LandingGrid />
      <LandingOrb className="-left-24 top-8 h-72 w-72 bg-emerald-300/20" />
      <LandingOrb className="-right-24 bottom-32 h-64 w-64 bg-teal-300/15" />

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/chat"
              className="text-sm font-medium text-emerald-700 hover:underline"
            >
              ← Back to chat
            </Link>
            <SectionLabel>Administration</SectionLabel>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-zinc-600">
              {description}
            </p>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}

export function AdminCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm ring-1 ring-black/[0.03] sm:p-6 ${className}`}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-zinc-600">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    indexed: "bg-emerald-50 text-emerald-800 border-emerald-200",
    pending: "bg-amber-50 text-amber-800 border-amber-200",
    failed: "bg-red-50 text-red-800 border-red-200",
    open: "bg-amber-50 text-amber-800 border-amber-200",
    in_progress: "bg-blue-50 text-blue-800 border-blue-200",
    resolved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };

  const label = status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] ?? "bg-zinc-50 text-zinc-700 border-zinc-200"}`}
    >
      {label}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-10 text-center text-sm text-zinc-500">
      {message}
    </div>
  );
}
