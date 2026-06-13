import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { recentListings, featuredListings } from "@/lib/listings";
import { ListingCard } from "@/components/listing/listing-card";

export const metadata: Metadata = { title: "Mis favoritos" };

// Demo: show first 5 listings as "saved"
const favorites = [...featuredListings, ...recentListings].slice(0, 5);

export default function FavoritosPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Favoritos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {favorites.length} anuncio{favorites.length !== 1 ? "s" : ""} guardado
          {favorites.length !== 1 ? "s" : ""}
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {favorites.map((listing) => (
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
