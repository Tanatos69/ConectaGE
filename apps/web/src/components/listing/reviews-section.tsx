"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, MessageSquare, ChevronDown } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import {
  submitReviewAction,
  submitStoreReviewAction,
  replyToReviewAction,
} from "@/lib/actions/reviews";

export interface ReviewItem {
  id: string;
  /** Not displayed — only used by the page to compute alreadyReviewed. */
  reviewerId?: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdLabel: string;
  sellerReply?: string | null;
}

function Stars({
  value,
  onChange,
  size = "sm",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "lg";
}) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < value;
        const cls = size === "lg" ? "size-6" : "size-3.5";
        if (!onChange) {
          return (
            <Star key={i} className={cn(cls, filled ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")} />
          );
        }
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            aria-label={`${i + 1} estrellas`}
            className="p-0.5"
          >
            <Star className={cn(cls, filled ? "fill-amber-400 text-amber-400" : "fill-muted text-muted", "transition-colors")} />
          </button>
        );
      })}
    </div>
  );
}

function WriteReviewForm({
  listingId,
  listingSlug,
  tiendaSlug,
}: {
  listingId?: string;
  listingSlug?: string;
  tiendaSlug?: string;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Selecciona una puntuación.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = tiendaSlug
        ? await submitStoreReviewAction({ tiendaSlug, rating, comment })
        : await submitReviewAction({ listingId: listingId!, listingSlug: listingSlug!, rating, comment });
      if (result?.error) setError(result.error);
      else setDone(true);
    });
  }

  if (done) {
    return (
      <p className="rounded-xl bg-green-50 px-3 py-2.5 text-sm text-green-700">
        ¡Gracias por tu reseña!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl bg-secondary/50 p-4">
      <p className="text-sm font-semibold text-foreground">
        {tiendaSlug ? "Escribe una reseña de esta tienda" : "Escribe una reseña"}
      </p>
      <Stars value={rating} onChange={setRating} size="lg" />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Cuenta tu experiencia con este vendedor o artículo…"
        rows={3}
        maxLength={1000}
        className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? "Publicando…" : "Publicar reseña"}
      </button>
    </form>
  );
}

function SellerReplyForm({
  reviewId,
  path,
}: {
  reviewId: string;
  /** Page to refresh after replying, e.g. /anuncios/x or /tienda/y. */
  path: string;
}) {
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 text-xs font-medium text-primary hover:underline"
      >
        Responder
      </button>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await replyToReviewAction({ reviewId, reply, path });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Escribe tu respuesta…"
        rows={2}
        maxLength={1000}
        className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar respuesta"}
      </button>
    </form>
  );
}

export function ReviewsSection({
  reviews,
  avgRating,
  totalCount,
  listingId,
  listingSlug,
  tiendaSlug,
  isLoggedIn = false,
  isSeller = false,
  alreadyReviewed = false,
  hasContacted = false,
}: {
  reviews: ReviewItem[];
  avgRating: number;
  totalCount: number;
  /** Listing target: set listingId + listingSlug. */
  listingId?: string;
  listingSlug?: string;
  /** Store target: set tiendaSlug instead. */
  tiendaSlug?: string;
  isLoggedIn?: boolean;
  isSeller?: boolean;
  alreadyReviewed?: boolean;
  /** Anti review-bombing: the form only unlocks after a WhatsApp contact. */
  hasContacted?: boolean;
}) {
  const router = useRouter();
  const hasTarget = Boolean((listingId && listingSlug) || tiendaSlug);
  const replyPath = tiendaSlug ? `/tienda/${tiendaSlug}` : `/anuncios/${listingSlug}`;
  const loginNext = tiendaSlug ? `/tienda/${tiendaSlug}` : `/anuncios/${listingSlug}`;
  const canReview = hasTarget && isLoggedIn && !isSeller && !alreadyReviewed && hasContacted;

  const [showAll, setShowAll] = useState(false);
  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

  function handleSeeMore() {
    if (isLoggedIn) setShowAll(true);
    else router.push(`/login?next=${loginNext}`);
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <MessageSquare className="size-5 text-primary" />
        <h2 className="text-base font-semibold text-foreground">
          Reseñas ({totalCount})
        </h2>
        {totalCount > 0 && (
          <div className="ml-auto flex items-center gap-1.5">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{avgRating}</span>
            <span className="text-sm text-muted-foreground">/ 5</span>
          </div>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="space-y-5">
          {visibleReviews.map((review) => (
            <article key={review.id} className="border-t pt-4 first:border-t-0 first:pt-0">
              <div className="flex items-start gap-3">
                <UserAvatar name={review.reviewerName} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{review.reviewerName}</span>
                    <span className="text-xs text-muted-foreground">{review.createdLabel}</span>
                  </div>
                  <Stars value={review.rating} />
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                  {review.sellerReply ? (
                    <div className="mt-2 rounded-xl bg-secondary px-3 py-2.5">
                      <p className="mb-1 text-xs font-semibold text-foreground">
                        Respuesta del vendedor:
                      </p>
                      <p className="text-xs text-muted-foreground">{review.sellerReply}</p>
                    </div>
                  ) : (
                    isSeller &&
                    hasTarget && <SellerReplyForm reviewId={review.id} path={replyPath} />
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!showAll && reviews.length > 3 && (
        <button
          type="button"
          onClick={handleSeeMore}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-input py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <ChevronDown className="size-4" />
          Ver más reseñas ({reviews.length - 3})
        </button>
      )}

      <div className="mt-5 border-t pt-4">
        {canReview ? (
          <WriteReviewForm
            listingId={listingId}
            listingSlug={listingSlug}
            tiendaSlug={tiendaSlug}
          />
        ) : alreadyReviewed ? (
          <p className="text-center text-sm text-muted-foreground">
            Ya has dejado tu reseña {tiendaSlug ? "en esta tienda" : "en este anuncio"}.
          </p>
        ) : isSeller || !hasTarget ? null : !isLoggedIn ? (
          <p className="text-center text-sm text-muted-foreground">
            <a href={`/login?next=${loginNext}`} className="font-medium text-primary hover:underline">
              Inicia sesión
            </a>{" "}
            para dejar una reseña
          </p>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Solo quienes han contactado con el vendedor por WhatsApp pueden dejar una reseña.
          </p>
        )}
      </div>
    </div>
  );
}
