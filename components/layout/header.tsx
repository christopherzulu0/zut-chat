import Link from "next/link";
import { getAuthContext } from "@/lib/auth";
import { SiteNav } from "./site-nav";

export async function SiteHeader() {
  const { isAdmin } = await getAuthContext();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/90 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-sm font-bold text-white">
            Z
          </span>
          <span className="font-semibold text-zinc-900">
            ZUT Student Support
          </span>
        </Link>
        <SiteNav serverIsAdmin={isAdmin} />
      </div>
    </header>
  );
}
