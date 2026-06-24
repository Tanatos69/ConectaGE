"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useAppState } from "@/lib/store/app-state";
import { getListingsBySlugs } from "@/lib/listings";
import { ListingCard } from "@/components/listing/listing-card";

export function FavoritesList() {
  const { favorites, hydrated } = useAppState();
  const listings = getListingsBySlugs(favorites);

  if (!hydrated) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] animate-pulse rounded-2xl border bg-secondary/60"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Favoritos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {listings.length} anuncio{listings.length !== 1 ? "s" : ""} guardado
          {listings.length !== 1 ? "s" : ""}
        </p>
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.slug} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-20 text-center shadow-sm">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-rose-50">
            <Heart className="size-7 text-rose-500" />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Aún no tienes favoritos
          </h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Guarda los anuncios que te interesen tocando el corazón en cualquier anuncio.
          </p>
          <Link
            href="/categorias"
            className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Explorar anuncios
          </Link>
        </div>
      )}
    </div>
  );
}
