"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

type AdminAccess = {
  isAdmin: boolean;
  checked: boolean;
};

export function useIsAdmin(serverIsAdmin = false): AdminAccess {
  const { isSignedIn, userId, sessionClaims } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setIsAdmin(false);
      setChecked(true);
      return;
    }

    if (!userLoaded) return;

    const claimRole = (
      sessionClaims as { metadata?: { role?: string } } | undefined
    )?.metadata?.role;
    const metadataRole = user?.publicMetadata?.role;

    if (
      serverIsAdmin ||
      claimRole === "admin" ||
      metadataRole === "admin"
    ) {
      setIsAdmin(true);
      setChecked(true);
      return;
    }

    let cancelled = false;

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { isAdmin: false }))
      .then((data: { isAdmin?: boolean }) => {
        if (!cancelled) {
          setIsAdmin(Boolean(data.isAdmin));
          setChecked(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsAdmin(false);
          setChecked(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    isSignedIn,
    userId,
    userLoaded,
    user?.publicMetadata,
    sessionClaims,
    serverIsAdmin,
  ]);

  return { isAdmin: checked && isAdmin, checked };
}
