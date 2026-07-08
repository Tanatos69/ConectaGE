"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import {
  approveSellerRequestAction,
  rejectSellerRequestAction,
} from "@/lib/actions/admin";

export function SellerRequestActions({ requestId }: { requestId: string }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function run(action: (id: string) => Promise<{ error?: string }>) {
    setError("");
    startTransition(async () => {
      const result = await action(requestId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button
          onClick={() => run(approveSellerRequestAction)}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          <Check className="size-3.5" />
          Aprobar
        </button>
        <button
          onClick={() => run(rejectSellerRequestAction)}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-xl border border-destructive/40 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-60"
        >
          <X className="size-3.5" />
          Rechazar
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
