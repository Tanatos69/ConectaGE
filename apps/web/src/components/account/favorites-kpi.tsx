"use client";

import Link from "next/link";
import { useAppState } from "@/lib/store/app-state";

/** Favorites stay on localStorage this pass, so their count is client-only. */
export function FavoritesKpi() {
  const { favorites } = useAppState();

  return (
    <Link
      href="/mi-cuenta/favoritos"
      className="rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <p className="text-2xl font-extrabold text-rose-600">{favorites.length}</p>
      <p className="mt-1 text-xs text-muted-foreground">Favoritos</p>
    </Link>
  );
}
