"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Star, SlidersHorizontal, Crown, X } from "lucide-react";
import { ListingCard } from "@/components/listing/listing-card";
import { featuredListings, allListings } from "@/lib/listings";
import { categories } from "@/lib/categories";
import { useAppState } from "@/lib/store/app-state";
import { cn } from "@/lib/utils";

const CITIES = ["Malabo", "Bata", "Mongomo", "Ebebiyín"];

export function DestacadosView() {
  const { isPromoted } = useAppState();
  const searchParams = useSearchParams();
  const router = useRouter();

  const cat = searchParams.get("cat") ?? "";
  const city = searchParams.get("ciudad") ?? "";
  const condition = searchParams.get("cond") ?? "";

  const [filtersOpen, setFiltersOpen] = useState(false);

  const promotedListings = allListings.filter((l) => isPromoted(l.slug));
  const staticFeatured = featuredListings.filter((l) => !isPromoted(l.slug));
  let combined = [...promotedListings, ...staticFeatured];

  if (cat) combined = combined.filter((l) => l.categorySlug === cat);
  if (city) combined = combined.filter((l) => l.city === city);
  if (condition) combined = combined.filter((l) => l.condition === condition);

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`/destacados?${p.toString()}`);
  }

  const activeFilters = [cat, city, condition].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-featured/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-featured-foreground">
            <Star className="size-3.5 fill-featured text-featured" />
            Destacados
          </span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Anuncios destacados
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {combined.length} anuncio{combined.length !== 1 ? "s" : ""} con mayor visibilidad
          </p>
        </div>
        <Link
          href="/planes"
          className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-featured/30 bg-featured/5 px-4 py-2 text-sm font-semibold text-featured-foreground transition-colors hover:bg-featured/10 sm:inline-flex"
        >
          <Crown className="size-4 fill-featured text-featured" />
          Destacar mi anuncio
        </Link>
      </div>

      <div className="flex gap-6">
        {/* Filter sidebar — desktop always visible, mobile visible when filtersOpen */}
        <aside className={cn("w-56 shrink-0 lg:block", filtersOpen ? "block" : "hidden")}>
          <div className="sticky top-24 space-y-6 rounded-xl border bg-card p-4">
            <button
              onClick={() => setFiltersOpen(false)}
              className="flex w-full items-center justify-between text-sm font-semibold text-foreground lg:hidden"
            >
              Filtros
              <X className="size-4" />
            </button>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Categoría
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setParam("cat", "")}
                  className={cn(
                    "w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors hover:bg-secondary",
                    !cat && "bg-secondary font-semibold",
                  )}
                >
                  Todas
                </button>
                {categories.slice(0, 8).map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setParam("cat", c.slug)}
                    className={cn(
                      "w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors hover:bg-secondary",
                      cat === c.slug && "bg-secondary font-semibold",
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ciudad
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setParam("ciudad", "")}
                  className={cn(
                    "w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors hover:bg-secondary",
                    !city && "bg-secondary font-semibold",
                  )}
                >
                  Todas
                </button>
                {CITIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setParam("ciudad", c)}
                    className={cn(
                      "w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors hover:bg-secondary",
                      city === c && "bg-secondary font-semibold",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Estado
              </h3>
              <div className="space-y-1">
                {[
                  { value: "", label: "Todos" },
                  { value: "new", label: "Nuevo" },
                  { value: "used", label: "Usado" },
                  { value: "refurbished", label: "Reacondicionado" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setParam("cond", opt.value)}
                    className={cn(
                      "w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors hover:bg-secondary",
                      condition === opt.value && "bg-secondary font-semibold",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {activeFilters > 0 && (
              <button
                onClick={() => router.push("/destacados")}
                className="w-full rounded-lg border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
              >
                Limpiar filtros ({activeFilters})
              </button>
            )}
          </div>
        </aside>

        {/* Main grid */}
        <div className="min-w-0 flex-1">
          {/* Mobile filter toggle */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <p className="text-sm text-muted-foreground">
              {combined.length} anuncio{combined.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <SlidersHorizontal className="size-4" />
              Filtros
              {activeFilters > 0 && (
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {combined.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {combined.map((listing, i) => (
                <ListingCard key={listing.slug} listing={listing} priority={i < 4} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-secondary">
                <Star className="size-7 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                No hay anuncios destacados con este filtro
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Prueba con otros filtros o{" "}
                <Link href="/planes" className="font-semibold text-primary hover:underline">
                  destaca tu anuncio
                </Link>{" "}
                para aparecer aquí.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
