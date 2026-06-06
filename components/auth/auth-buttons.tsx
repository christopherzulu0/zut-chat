"use client";

import { useClerk } from "@clerk/nextjs";

type AuthButtonProps = {
  className?: string;
  children: React.ReactNode;
};

const CHAT_REDIRECT = { forceRedirectUrl: "/chat" as const };

export function SignUpAuthButton({ className, children }: AuthButtonProps) {
  const { openSignUp } = useClerk();

  return (
    <button
      type="button"
      className={className}
      onClick={() => openSignUp(CHAT_REDIRECT)}
    >
      {children}
    </button>
  );
}

export function SignInAuthButton({ className, children }: AuthButtonProps) {
  const { openSignIn } = useClerk();

  return (
    <button
      type="button"
      className={className}
      onClick={() => openSignIn(CHAT_REDIRECT)}
    >
      {children}
    </button>
  );
}
