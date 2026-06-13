"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { pendingReviews, type PendingReview } from "@/lib/demo-admin";
import { UserAvatar } from "@/components/ui/user-avatar";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-3.5 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  onAction,
}: {
  review: PendingReview;
  onAction: (id: string, action: "approve" | "reject" | "delete") => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar name={review.reviewerName} size="sm" />
          <div>
            <p className="text-sm font-semibold text-foreground">{review.reviewerName}</p>
            <p className="text-xs text-muted-foreground">{review.date}</p>
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Sobre el anuncio</p>
        <Link
          href={`/anuncios/${review.listingSlug}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          {review.listingTitle}
        </Link>
      </div>

      <blockquote className="rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground italic">
        "{review.comment}"
      </blockquote>

      {!confirming ? (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onAction(review.id, "approve")}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            <CheckCircle className="size-4" />
            Aprobar
          </button>
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white hover:bg-destructive/90"
          >
            <XCircle className="size-4" />
            Rechazar
          </button>
          <button
            onClick={() => onAction(review.id, "delete")}
            className="flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
          >
            <Trash2 className="size-4" />
            Eliminar
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">¿Confirmar rechazo de esta reseña?</p>
          <div className="flex gap-2">
            <button
              onClick={() => onAction(review.id, "reject")}
              className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white hover:bg-destructive/90"
            >
              Confirmar rechazo
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminResenasPage() {
  const [reviews, setReviews] = useState(pendingReviews);
  const [log, setLog] = useState<string[]>([]);

  function handleAction(id: string, action: "approve" | "reject" | "delete") {
    const review = reviews.find((r) => r.id === id);
    if (!review) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));
    const labels = { approve: "Aprobada", reject: "Rechazada", delete: "Eliminada" };
    setLog((prev) => [`"${review.reviewerName}": ${labels[action]}`, ...prev]);
  }

  function approveAll() {
    reviews.forEach((r) => {
      setLog((prev) => [`"${r.reviewerName}": Aprobada`, ...prev]);
    });
    setReviews([]);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Moderación de reseñas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {reviews.length} reseña{reviews.length !== 1 ? "s" : ""} pendiente{reviews.length !== 1 ? "s" : ""}
          </p>
        </div>
        {reviews.length > 0 && (
          <button
            onClick={approveAll}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            <CheckCircle className="size-4" />
            Aprobar todas
          </button>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-20 text-center shadow-sm">
          <Star className="mb-3 size-12 text-amber-300" />
          <p className="text-base font-semibold text-foreground">Sin reseñas pendientes</p>
          <p className="mt-1 text-sm text-muted-foreground">Todas las reseñas han sido revisadas.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} onAction={handleAction} />
          ))}
        </div>
      )}

      {log.length > 0 && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-foreground">Acciones realizadas</p>
          <ul className="space-y-1">
            {log.map((entry, i) => (
              <li key={i} className="text-xs text-muted-foreground">· {entry}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
