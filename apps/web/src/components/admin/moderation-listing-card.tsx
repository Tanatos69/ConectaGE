"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Flag, Clock, Ban, Trash2 } from "lucide-react";
import { unpublishListingAction, adminDeleteListingAction } from "@/lib/actions/admin";
import type { AdminModerationListing } from "@/app/admin/data";
import { categories } from "@/lib/categories";
import { formatNumber } from "@/lib/format";
import { postedLabel } from "@/lib/time";

function categoryName(slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

export function ModerationListingCard({ listing }: { listing: AdminModerationListing }) {
  const [unpublishing, setUnpublishing] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function runUnpublish() {
    setError("");
    startTransition(async () => {
      const result = await unpublishListingAction(listing.id, reason);
      if (result?.error) setError(result.error);
      else setUnpublishing(false);
    });
  }

  function runDelete() {
    if (
      !window.confirm(`¿Eliminar el anuncio "${listing.title}"? Esta acción no se puede deshacer.`)
    )
      return;
    setError("");
    startTransition(async () => {
      const result = await adminDeleteListingAction(listing.id);
      if (result?.error) setError(result.error);
    });
  }

  const flagged = listing.duplicateCount > 0 || listing.pendingReportCount > 0;

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex gap-4 p-5">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
          <Image
            src={listing.images[0] || "/demo/placeholder.jpg"}
            alt={listing.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-start gap-2">
            <Link
              href={`/anuncios/${listing.slug}`}
              target="_blank"
              className="text-base font-semibold text-foreground hover:text-primary hover:underline"
            >
              {listing.title}
            </Link>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              {categoryName(listing.category_slug)}
            </span>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>{listing.price != null ? `${formatNumber(Number(listing.price))} FCFA` : "—"}</span>
            <span>·</span>
            <span>{listing.city}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {postedLabel(listing.created_at)}
            </span>
          </div>

          {flagged && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {listing.duplicateCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
                  <AlertTriangle className="size-3" />
                  {listing.duplicateCount} anuncio{listing.duplicateCount > 1 ? "s" : ""} similar
                  {listing.duplicateCount > 1 ? "es" : ""} del mismo vendedor
                </span>
              )}
              {listing.pendingReportCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                  <Flag className="size-3" />
                  {listing.pendingReportCount} reporte{listing.pendingReportCount > 1 ? "s" : ""}{" "}
                  pendiente{listing.pendingReportCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
        <Link
          href={`/admin/usuarios/${listing.sellerId}`}
          className="font-medium text-foreground hover:text-primary hover:underline"
        >
          {listing.sellerName}
        </Link>
        <span>{listing.sellerEmail}</span>
      </div>

      <div className="border-t px-5 py-3">
        {!unpublishing ? (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setUnpublishing(true)}
              className="flex items-center gap-2 rounded-xl border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-100"
            >
              <Ban className="size-4" />
              Despublicar
            </button>
            <button
              onClick={runDelete}
              disabled={pending}
              className="flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-destructive/90 disabled:opacity-60"
            >
              <Trash2 className="size-4" />
              Eliminar
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Motivo:</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Explica por qué se retira este anuncio…"
              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <div className="flex gap-2">
              <button
                onClick={runUnpublish}
                disabled={pending || !reason.trim()}
                className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Despublicando…" : "Confirmar"}
              </button>
              <button
                onClick={() => {
                  setUnpublishing(false);
                  setReason("");
                }}
                className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
