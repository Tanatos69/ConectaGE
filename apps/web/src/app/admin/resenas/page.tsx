import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { getAdminReviews } from "../data";
import { postedLabel } from "@/lib/time";
import { DeleteReviewButton } from "@/components/admin/admin-row-actions";

export const metadata: Metadata = { title: "Reseñas" };

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < value ? "size-3.5 fill-amber-400 text-amber-400" : "size-3.5 fill-muted text-muted"
          }
        />
      ))}
    </div>
  );
}

export default async function AdminResenasPage() {
  const reviews = await getAdminReviews();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reseñas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {reviews.length.toLocaleString("es-ES")} reseñas publicadas. Elimina las que incumplan
          las normas (spam, lenguaje ofensivo, reseñas falsas).
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center">
          <Star className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">Todavía no hay reseñas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{r.reviewerName}</span>
                    <Stars value={r.rating} />
                    <span className="text-xs text-muted-foreground">
                      {postedLabel(r.created_at)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{r.reviewerEmail}</p>
                  <Link
                    href={r.targetHref}
                    className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                  >
                    {r.targetLabel}
                  </Link>
                  <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                  {r.seller_reply && (
                    <p className="mt-2 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Respuesta del vendedor: </span>
                      {r.seller_reply}
                    </p>
                  )}
                </div>
                <DeleteReviewButton reviewId={r.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
