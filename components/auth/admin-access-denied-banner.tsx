"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function AdminAccessDeniedBanner() {
  const searchParams = useSearchParams();
  const [showDenied, setShowDenied] = useState(false);

  useEffect(() => {
    setShowDenied(searchParams.get("admin") === "denied");
  }, [searchParams]);

  if (!showDenied) return null;

  return (
    <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p>
        Admin access required. Ask an administrator to grant your account the
        admin role.
      </p>
      <button
        type="button"
        onClick={() => setShowDenied(false)}
        className="shrink-0 text-amber-700 hover:text-amber-900"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
