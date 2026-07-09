"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, Heart, Pencil, Trash2, Star, ExternalLink, Plus } from "lucide-react";
import type { ListingStatus } from "@/lib/demo-user";
import { formatPrice } from "@/lib/format";
import { useAppState } from "@/lib/store/app-state";
import { PromoteDialog } from "@/components/promote/promote-dialog";
import { deleteListingAction } from "@/lib/actions/listings";

export interface MyListingItem {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  priceType: "fixed" | "negotiable" | "free" | "on_request";
  currency: "XAF" | "USD" | "EUR";
  city: string;
  categoryName: string;
  image: string;
  status: ListingStatus;
  views: number;
  favorites: number;
  postedLabel: string;
}

const tabs: { key: ListingStatus | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "published", label: "Publicados" },
  { key: "pending", label: "En revisión" },
  { key: "rejected", label: "Rechazados" },
  { key: "expired", label: "Expirados" },
];

const statusStyle: Record<ListingStatus, string> = {
  published: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
  expired: "bg-muted text-muted-foreground",
};

const statusLabel: Record<ListingStatus, string> = {
  published: "Publicado",
  pending: "En revisión",
  rejected: "Rechazado",
  expired: "Expirado",
};

export function MyListingsList({ items }: { items: MyListingItem[] }) {
  const [active, setActive] = useState<ListingStatus | "all">("all");
  const [promote, setPromote] = useState<{ slug: string; title: string } | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const { isPromoted } = useAppState();

  const listings = active === "all" ? items : items.filter((l) => l.status === active);

  const counts = tabs.map(({ key }) => ({
    key,
    count: key === "all" ? items.length : items.filter((l) => l.status === key).length,
  }));

  function handleDelete(item: MyListingItem) {
    if (!window.confirm(`¿Eliminar "${item.title}"? Esta acción no se puede deshacer.`)) return;
    setError("");
    setDeletingId(item.id);
    startTransition(async () => {
      const result = await deleteListingAction(item.id);
      if (result?.error) setError(result.error);
      setDeletingId(null);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Mis anuncios</h1>
        <Link
          href="/publicar"
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Nuevo
        </Link>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      {/* Tabs */}
      <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border bg-card p-1.5 shadow-sm">
        {tabs.map(({ key, label }) => {
          const c = counts.find((x) => x.key === key)?.count ?? 0;
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                active === key
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {label}
              {c > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                  active === key ? "bg-white/20" : "bg-muted"
                }`}>
                  {c}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border bg-card">
          <p className="text-muted-foreground text-sm">
            {items.length === 0
              ? "Aún no has publicado ningún anuncio."
              : "No tienes anuncios en este estado."}
          </p>
          <Link href="/publicar" className="mt-3 text-sm font-medium text-primary hover:underline">
            Publicar un anuncio →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div key={listing.id} className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  <Image src={listing.image} alt={listing.title} fill sizes="64px" className="object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="font-semibold text-foreground text-sm leading-snug max-w-xs truncate">
                      {listing.title}
                    </p>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle[listing.status]}`}>
                      {statusLabel[listing.status]}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{listing.categoryName}</span>
                    <span>{listing.city}</span>
                    <span className="font-medium text-foreground">{formatPrice(listing)}</span>
                    {listing.views > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="size-3" />
                        {listing.views} vistas
                      </span>
                    )}
                    {listing.favorites > 0 && (
                      <span className="flex items-center gap-1">
                        <Heart className="size-3 fill-rose-500 text-rose-500" />
                        {listing.favorites}
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-xs text-muted-foreground">{listing.postedLabel}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                {listing.status === "published" && (
                  <Link
                    href={`/anuncios/${listing.slug}`}
                    className="flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5" />
                    Ver
                  </Link>
                )}
                <Link
                  href={`/mi-cuenta/anuncios/${listing.id}/editar`}
                  className="flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <Pencil className="size-3.5" />
                  Editar
                </Link>
                {listing.status === "published" &&
                  (isPromoted(listing.slug) ? (
                    <span className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                      <Star className="size-3.5 fill-amber-400 text-amber-500" />
                      Destacado
                    </span>
                  ) : (
                    <button
                      onClick={() => setPromote({ slug: listing.slug, title: listing.title })}
                      className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
                    >
                      <Star className="size-3.5" />
                      Destacar
                    </button>
                  ))}
                <button
                  onClick={() => handleDelete(listing)}
                  disabled={deletingId === listing.id}
                  className="flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" />
                  {deletingId === listing.id ? "Eliminando…" : "Eliminar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {promote && (
        <PromoteDialog
          slug={promote.slug}
          title={promote.title}
          onClose={() => setPromote(null)}
        />
      )}
    </div>
  );
}
