import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-sm font-bold text-white">
            Z
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            ZUT Student Support
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/chat" className="text-zinc-600 hover:text-emerald-700">
            Chat
          </Link>
          <Show when="signed-in">
            <Link
              href="/admin"
              className="text-zinc-600 hover:text-emerald-700"
            >
              Admin
            </Link>
          </Show>
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal" />
            </Show>
            <Show when="signed-out">
              <SignUpButton mode="modal" />
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </nav>
      </div>
    </header>
  );
}
