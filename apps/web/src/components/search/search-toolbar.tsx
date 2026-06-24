"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useAppState, type SearchCriteria } from "@/lib/store/app-state";
import { criteriaToSearchUrl } from "@/lib/search";
import { cn } from "@/lib/utils";

const chips: { key: "offer" | "wanted" | undefined; label: string }[] = [
  { key: undefined, label: "Todos" },
  { key: "offer", label: "Ofertas" },
  { key: "wanted", label: "Busco" },
];

/**
 * Type filter (Todos / Ofertas / Busco) + "Guardar búsqueda". The chips are
 * links that set the `tipo` URL param (functional, server-side filtering); the
 * save button stores the active criteria for alerts.
 */
export function SearchToolbar({ criteria }: { criteria: SearchCriteria }) {
  const { addSavedSearch } = useAppState();
  const [saved, setSaved] = useState(false);

  function buildLabel() {
    const parts: string[] = [];
    if (criteria.q) parts.push(`"${criteria.q}"`);
    if (criteria.listingType === "wanted") parts.push("Busco");
    if (criteria.city) parts.push(criteria.city);
    return parts.length > 0 ? parts.join(" · ") : "Todos los anuncios";
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5">
        {chips.map((c) => {
          const active = (criteria.listingType ?? undefined) === c.key;
          return (
            <Link
              key={c.label}
              href={criteriaToSearchUrl({ ...criteria, listingType: c.key })}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-white"
                  : "border-input bg-background text-muted-foreground hover:bg-secondary",
              )}
            >
              {c.label}
            </Link>
          );
        })}
      </div>

      <div className="ml-auto">
        {saved ? (
          <Link
            href="/mi-cuenta/busquedas"
            className="flex items-center gap-1.5 rounded-full bg-green-50 px-3.5 py-1.5 text-sm font-semibold text-green-700"
          >
            <BookmarkCheck className="size-4" />
            Búsqueda guardada
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              addSavedSearch(buildLabel(), criteria);
              setSaved(true);
            }}
            className="flex items-center gap-1.5 rounded-full border border-primary px-3.5 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            <Bookmark className="size-4" />
            Guardar búsqueda
          </button>
        )}
      </div>
    </div>
  );
}
