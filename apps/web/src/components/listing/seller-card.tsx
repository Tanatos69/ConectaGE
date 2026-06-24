import Link from "next/link";
import { Star, CheckCircle, ExternalLink, Store } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import type { SellerProfile } from "@/lib/demo-detail";

export function SellerCard({ seller }: { seller: SellerProfile }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Vendedor
      </p>
      <div className="flex items-start gap-3">
        <UserAvatar name={seller.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-foreground">{seller.name}</span>
            {seller.verified && (
              <CheckCircle className="size-4 shrink-0 text-blue-600" aria-label="Vendedor verificado" />
            )}
            <Badge variant={seller.professional ? "pro" : "muted"}>
              {seller.professional ? "Profesional" : "Particular"}
            </Badge>
          </div>
          <div className="mt-0.5 flex items-center gap-1">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">{seller.rating}</span>
            <span className="text-xs text-muted-foreground">({seller.reviewsCount} reseñas)</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Miembro desde {seller.memberSince} · {seller.city}
          </p>
          <p className="text-xs text-muted-foreground">
            {seller.activeListings} anuncios activos
          </p>
        </div>
      </div>

      {seller.bio && (
        <p className="mt-3 border-t pt-3 text-sm text-muted-foreground">{seller.bio}</p>
      )}

      {seller.storeSlug && (
        <Link
          href={`/tienda/${seller.storeSlug}`}
          className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-secondary py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/70"
        >
          <Store className="size-4" />
          Visitar tienda
        </Link>
      )}

      <Link
        href={`/usuario/${seller.username}`}
        className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        Ver todos sus anuncios
        <ExternalLink className="size-3.5" />
      </Link>
    </div>
  );
}
