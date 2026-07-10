"use client";

import { useState, useTransition } from "react";
import { Trash2, Check, X } from "lucide-react";
import {
  adminDeleteListingAction,
  adminDeleteReviewAction,
  resolveReportAction,
} from "@/lib/actions/admin";

function useAction() {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  function run(fn: () => Promise<{ error?: string }>, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setError("");
    startTransition(async () => {
      const result = await fn();
      if (result?.error) setError(result.error);
    });
  }
  return { error, pending, run };
}

export function DeleteListingButton({ listingId, title }: { listingId: string; title: string }) {
  const { error, pending, run } = useAction();
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() =>
          run(
            () => adminDeleteListingAction(listingId),
            `¿Eliminar el anuncio "${title}"? Esta acción no se puede deshacer.`,
          )
        }
        disabled={pending}
        className="flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-50"
      >
        <Trash2 className="size-3.5" />
        {pending ? "Eliminando…" : "Eliminar"}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const { error, pending, run } = useAction();
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() =>
          run(
            () => adminDeleteReviewAction(reviewId),
            "¿Eliminar esta reseña? Esta acción no se puede deshacer.",
          )
        }
        disabled={pending}
        className="flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-50"
      >
        <Trash2 className="size-3.5" />
        {pending ? "Eliminando…" : "Eliminar"}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function ReportActions({ reportId, listingTitle }: { reportId: string; listingTitle: string }) {
  const { error, pending, run } = useAction();
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          onClick={() =>
            run(
              () => resolveReportAction(reportId, "resolved", { deleteListing: true }),
              `¿Eliminar el anuncio "${listingTitle}" y marcar el reporte como resuelto?`,
            )
          }
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-white hover:bg-destructive/90 disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
          Eliminar anuncio
        </button>
        <button
          onClick={() => run(() => resolveReportAction(reportId, "resolved"))}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          <Check className="size-3.5" />
          Resuelto
        </button>
        <button
          onClick={() => run(() => resolveReportAction(reportId, "dismissed"))}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary disabled:opacity-50"
        >
          <X className="size-3.5" />
          Descartar
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
