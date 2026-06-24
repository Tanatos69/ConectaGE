"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/listing/favorite-button";
import { formatPrice } from "@/lib/format";
import type { Listing } from "@/lib/listings";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { useAppState } from "@/lib/store/app-state";

export function ListingCard({
  listing,
  priority = false,
  className,
}: {
  listing: Listing;
  priority?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const { isPromoted } = useAppState();
  const negotiable = listing.priceType === "negotiable";
  const featured = listing.featured || isPromoted(listing.slug);

  const conditionLabel: Record<string, string> = {
    new: t("card.new"),
    used: t("card.used"),
    refurbished: t("card.refurbished"),
  };

  return (
    <Link
      href={`/anuncios/${listing.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 focus-visible:-translate-y-1",
        featured
          ? "border-amber-300/70 shadow-[var(--shadow-featured)] hover:shadow-[var(--shadow-featured)] ring-1 ring-amber-200/50"
          : "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
        className,
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top badges */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          <div className="flex flex-col gap-1.5">
            {listing.listingType === "wanted" && (
              <Badge variant="wanted" className="shadow-sm">{t("card.wanted")}</Badge>
            )}
            {featured && (
              <Badge variant="featured" className="shadow-sm">
                <Star className="size-3 fill-current" />
                {t("card.featured")}
              </Badge>
            )}
            {listing.condition === "new" && (
              <Badge variant="new" className="shadow-sm">{t("card.new")}</Badge>
            )}
          </div>
          <FavoriteButton slug={listing.slug} />
        </div>
      </div>

      {listing.featured && (
        <div className="h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
      )}

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center gap-2">
          <Badge variant="muted">{listing.categoryName}</Badge>
          {listing.condition && listing.condition !== "new" && (
            <span className="text-xs text-muted-foreground">
              {conditionLabel[listing.condition]}
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
          {listing.title}
        </h3>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold tracking-tight text-foreground">
              {formatPrice(listing)}
            </span>
            {negotiable && (
              <span className="text-xs font-medium text-muted-foreground">{t("card.negotiable")}</span>
            )}
          </div>

          <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {listing.city}
            </span>
            <span>{listing.postedLabel}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
