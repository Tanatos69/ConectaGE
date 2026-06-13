import Link from "next/link";
import { Star, MessageSquare } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/demo-detail";

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < value ? "fill-amber-400 text-amber-400" : "fill-muted text-muted",
          )}
        />
      ))}
    </div>
  );
}

export function ReviewsSection({
  reviews,
  avgRating,
  totalCount,
}: {
  reviews: Review[];
  avgRating: number;
  totalCount: number;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <MessageSquare className="size-5 text-primary" />
        <h2 className="text-base font-semibold text-foreground">
          Reseñas ({totalCount})
        </h2>
        <div className="ml-auto flex items-center gap-1.5">
          <Star className="size-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold">{avgRating}</span>
          <span className="text-sm text-muted-foreground">/ 5</span>
        </div>
      </div>

      <div className="space-y-5">
        {reviews.map((review) => (
          <article key={review.id} className="border-t pt-4 first:border-t-0 first:pt-0">
            <div className="flex items-start gap-3">
              <UserAvatar name={review.reviewerName} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{review.reviewerName}</span>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <Stars value={review.rating} />
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {review.comment}
                </p>
                {review.sellerReply && (
                  <div className="mt-2 rounded-xl bg-secondary px-3 py-2.5">
                    <p className="mb-1 text-xs font-semibold text-foreground">
                      Respuesta del vendedor:
                    </p>
                    <p className="text-xs text-muted-foreground">{review.sellerReply}</p>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 border-t pt-4 text-center">
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Inicia sesión
          </Link>{" "}
          para dejar una reseña
        </p>
      </div>
    </div>
  );
}
