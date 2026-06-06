"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Show, UserButton } from "@clerk/nextjs";
import { SignInAuthButton, SignUpAuthButton } from "@/components/auth/auth-buttons";
import { useIsAdmin } from "@/components/auth/use-is-admin";

type SiteNavProps = {
  serverIsAdmin?: boolean;
};

export function SiteNav({ serverIsAdmin = false }: SiteNavProps) {
  const { isSignedIn } = useAuth();
  const { isAdmin } = useIsAdmin(serverIsAdmin);

  return (
    <nav className="flex items-center gap-4 text-sm">
      {isSignedIn && (
        <div className="flex items-center gap-4">
          <Link
            href="/chat"
            className="font-medium text-zinc-600 hover:text-emerald-700"
          >
            Chat
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="font-medium text-zinc-600 hover:text-emerald-700"
            >
              Admin
            </Link>
          )}
        </div>
      )}
      <div className="flex items-center gap-3">
        <Show when="signed-out">
          <div className="flex items-center gap-3">
            <SignInAuthButton className="text-zinc-600 hover:text-emerald-700">
              Sign in
            </SignInAuthButton>
            <SignUpAuthButton className="rounded-full bg-emerald-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-800">
              Get started
            </SignUpAuthButton>
          </div>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </nav>
  );
}
