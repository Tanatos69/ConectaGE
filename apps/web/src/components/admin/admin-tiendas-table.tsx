"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search, Eye, CheckCircle, XCircle, ShieldCheck, Store } from "lucide-react";
import type { AdminTiendaRow } from "@/app/admin/data";
import { verifyTiendaAction, unverifyTiendaAction } from "@/lib/actions/admin";
import { categories } from "@/lib/categories";
import { monthYearLabel } from "@/lib/time";
import { cn } from "@/lib/utils";

function categoryName(slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

type StatusFilter = "all" | "verified" | "unverified";

function VerifyActions({ tiendaId, verified }: { tiendaId: string; verified: boolean }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function toggle(next: boolean) {
    setError("");
    startTransition(async () => {
      const result = next ? await verifyTiendaAction(tiendaId) : await unverifyTiendaAction(tiendaId);
      if (result?.error) setError(result.error);
    });
  }

  if (verified) {
    return (
      <div className="flex items-center justify-end gap-1">
        <span className="flex size-7 items-center justify-center" title="Verificada">
          <ShieldCheck className="size-3.5 text-primary" />
        </span>
        <button
          type="button"
          onClick={() => toggle(false)}
          disabled={pending}
          title="Retirar verificación"
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary disabled:opacity-50"
        >
          <XCircle className="size-3.5" />
        </button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => toggle(true)}
        disabled={pending}
        title="Verificar"
        className="flex size-7 items-center justify-center rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-50"
      >
        <CheckCircle className="size-3.5" />
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function AdminTiendasTable({ tiendas }: { tiendas: AdminTiendaRow[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tiendas.filter((t) => {
      if (statusFilter === "verified" && !t.verified) return false;
      if (statusFilter === "unverified" && t.verified) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.ownerName.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q)
      );
    });
  }, [tiendas, query, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar por nombre, propietario o ciudad…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "verified", "unverified"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === f
                  ? "bg-primary text-white"
                  : "border border-input bg-background text-muted-foreground hover:bg-secondary",
              )}
            >
              {f === "all" ? "Todas" : f === "verified" ? "Verificadas" : "No verificadas"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center">
          <Store className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">
            {tiendas.length === 0 ? "Todavía no hay tiendas" : "Ninguna tienda coincide con la búsqueda"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/40 text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-3 text-left">Tienda</th>
                  <th className="px-4 py-3 text-left">Propietario</th>
                  <th className="px-4 py-3 text-left">Ciudad</th>
                  <th className="px-4 py-3 text-left">Categoría</th>
                  <th className="px-4 py-3 text-right">Seguidores</th>
                  <th className="px-4 py-3 text-right">Anuncios</th>
                  <th className="px-4 py-3 text-left">Desde</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <p className="truncate font-medium text-foreground">{t.name}</p>
                      <p className="truncate text-xs text-muted-foreground">/{t.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <Link
                        href={`/admin/usuarios/${t.ownerId}`}
                        className="hover:text-primary hover:underline"
                      >
                        {t.ownerName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.city || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{categoryName(t.category_slug)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {t.followers_count.toLocaleString("es")}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{t.listingsCount}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {monthYearLabel(t.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/tienda/${t.slug}`}
                          target="_blank"
                          title="Ver tienda"
                          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <Eye className="size-3.5" />
                        </Link>
                        <VerifyActions tiendaId={t.id} verified={t.verified} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
