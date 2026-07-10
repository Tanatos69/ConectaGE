"use client";

import { useState, useTransition } from "react";
import { Trash2, Check, X, Ban } from "lucide-react";
import {
  adminDeleteListingAction,
  adminDeleteReviewAction,
  resolveReportAction,
  unpublishListingAction,
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

/**
 * Whole-listing actions on a report group: eliminate the listing (cascades
 * to resolve every pending report on it — resolveReportAction looks up the
 * listing_slug from whichever report id it's given) or take it down
 * temporarily while the report is investigated, without resolving anything.
 */
export function ListingReportActions({
  listingId,
  listingTitle,
  anyPendingReportId,
}: {
  listingId: string;
  listingTitle: string;
  anyPendingReportId: string;
}) {
  const { error, pending, run } = useAction();
  const [unpublishing, setUnpublishing] = useState(false);
  const [reason, setReason] = useState("");
  const [unpublishError, setUnpublishError] = useState("");
  const [unpublishPending, startUnpublish] = useTransition();

  function confirmUnpublish() {
    setUnpublishError("");
    startUnpublish(async () => {
      const result = await unpublishListingAction(listingId, reason);
      if (result?.error) setUnpublishError(result.error);
      else {
        setUnpublishing(false);
        setReason("");
      }
    });
  }

  if (unpublishing) {
    return (
      <div className="w-full space-y-2 sm:w-72">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          placeholder="Motivo (se mostrará al vendedor)…"
          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        <div className="flex gap-2">
          <button
            onClick={confirmUnpublish}
            disabled={unpublishPending || !reason.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {unpublishPending ? "Despublicando…" : "Confirmar"}
          </button>
          <button
            onClick={() => {
              setUnpublishing(false);
              setReason("");
            }}
            className="rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
          >
            Cancelar
          </button>
        </div>
        {unpublishError && <p className="text-xs text-destructive">{unpublishError}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          onClick={() =>
            run(
              () => resolveReportAction(anyPendingReportId, "resolved", { deleteListing: true }),
              `¿Eliminar el anuncio "${listingTitle}" y marcar sus reportes pendientes como resueltos?`,
            )
          }
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-white hover:bg-destructive/90 disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
          Eliminar anuncio
        </button>
        <button
          onClick={() => setUnpublishing(true)}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100 disabled:opacity-50"
        >
          <Ban className="size-3.5" />
          Despublicar (investigar)
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/** Per-report outcome — a listing can have several reports that don't all
 * need the same verdict (one might be spurious while another is valid). */
export function SingleReportActions({ reportId }: { reportId: string }) {
  const { error, pending, run } = useAction();
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          onClick={() => run(() => resolveReportAction(reportId, "resolved"))}
          disabled={pending}
          className="flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          <Check className="size-3" />
          Resuelto
        </button>
        <button
          onClick={() => run(() => resolveReportAction(reportId, "dismissed"))}
          disabled={pending}
          className="flex items-center gap-1 rounded-lg border border-input px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-secondary disabled:opacity-50"
        >
          <X className="size-3" />
          Descartar
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
