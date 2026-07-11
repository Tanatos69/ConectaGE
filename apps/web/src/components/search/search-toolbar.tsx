"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { addSavedSearchAction } from "@/lib/actions/saved-searches";
import { criteriaToSearchUrl, type SearchCriteria } from "@/lib/search";
import { cn } from "@/lib/utils";

const chips: { key: "offer" | "wanted" | undefined; label: string }[] = [
  { key: undefined, label: "Todos" },
  { key: "offer", label: "Ofertas" },
  { key: "wanted", label: "Busco" },
];

/**
 * Type filter (Todos / Ofertas / Busco) + "Guardar búsqueda". The chips are
 * links that set the `tipo` URL param (functional, server-side filtering);
 * the save button persists the active criteria to saved_searches for alerts
 * (login required — anonymous users are sent to /login first).
 */
export function SearchToolbar({ criteria, leading }: { criteria: SearchCriteria; leading?: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Saved/error state is keyed to the criteria it belongs to, so changing
  // the search resets both without needing an effect.
  const criteriaKey = JSON.stringify(criteria);
  const [savedFor, setSavedFor] = useState<string | null>(null);
  const [errorFor, setErrorFor] = useState<{ key: string; msg: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const saved = savedFor === criteriaKey;
  const error = errorFor?.key === criteriaKey ? errorFor.msg : "";

  function buildLabel() {
    const parts: string[] = [];
    if (criteria.q) parts.push(`"${criteria.q}"`);
    if (criteria.listingType === "wanted") parts.push("Busco");
    if (criteria.city) parts.push(criteria.city);
    return parts.length > 0 ? parts.join(" · ") : "Todos los anuncios";
  }

  function save() {
    if (!user) {
      const qs = searchParams.toString();
      router.push(`/login?next=${encodeURIComponent(qs ? `${pathname}?${qs}` : pathname)}`);
      return;
    }
    setErrorFor(null);
    startTransition(async () => {
      const result = await addSavedSearchAction(buildLabel(), criteria);
      if (result?.error) setErrorFor({ key: criteriaKey, msg: result.error });
      else setSavedFor(criteriaKey);
    });
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {leading}
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

      <div className="ml-auto flex items-center gap-2">
        {error && <span className="text-xs text-destructive">{error}</span>}
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
            onClick={save}
            disabled={pending}
            className="flex items-center gap-1.5 rounded-full border border-primary px-3.5 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-60"
          >
            <Bookmark className="size-4" />
            {pending ? "Guardando…" : "Guardar búsqueda"}
          </button>
        )}
      </div>
    </div>
  );
}
