"use client";

import Link from "next/link";
import { BellRing, Bell, Search, Trash2, ArrowRight } from "lucide-react";
import { useAppState } from "@/lib/store/app-state";
import { allListings } from "@/lib/listings";
import { filterListings, criteriaToSearchUrl } from "@/lib/search";
import { cn } from "@/lib/utils";

export function SavedSearchesView() {
  const { savedSearches, removeSavedSearch, toggleSearchAlerts, hydrated } = useAppState();

  if (!hydrated) {
    return <div className="h-48 animate-pulse rounded-2xl border bg-secondary/60" />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Búsquedas guardadas y alertas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Guarda una búsqueda y te avisaremos por WhatsApp cuando aparezcan anuncios que coincidan.
        </p>
      </div>

      {savedSearches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center shadow-sm">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Search className="size-7 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Aún no tienes búsquedas guardadas
          </h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Haz una búsqueda y pulsa &ldquo;Guardar búsqueda&rdquo; para recibir alertas.
          </p>
          <Link
            href="/buscar"
            className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Ir a buscar
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {savedSearches.map((s) => {
            const matches = filterListings(allListings, s.criteria).length;
            return (
              <div
                key={s.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-foreground">{s.label}</p>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {matches} ahora
                    </span>
                  </div>
                  <Link
                    href={criteriaToSearchUrl(s.criteria)}
                    className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Ver resultados
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSearchAlerts(s.id)}
                  aria-pressed={s.alerts}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                    s.alerts
                      ? "bg-primary/10 text-primary"
                      : "border border-input text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {s.alerts ? <BellRing className="size-4" /> : <Bell className="size-4" />}
                  {s.alerts ? "Alertas activas" : "Alertas off"}
                </button>

                <button
                  type="button"
                  onClick={() => removeSavedSearch(s.id)}
                  aria-label="Eliminar búsqueda"
                  className="flex size-9 items-center justify-center rounded-xl border border-input text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
