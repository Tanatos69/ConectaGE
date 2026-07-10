"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Search } from "lucide-react";
import type { AdminListingRow } from "@/app/admin/data";
import { categories } from "@/lib/categories";
import { formatNumber } from "@/lib/format";
import { postedLabel } from "@/lib/time";
import { DeleteListingButton } from "./admin-row-actions";

const statusLabel: Record<string, string> = {
  published: "Publicado",
  pending: "En revisión",
  rejected: "Rechazado",
  expired: "Expirado",
};

const statusStyle: Record<string, string> = {
  published: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
  expired: "bg-muted text-muted-foreground",
};

function categoryName(slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

type SortOption = "newest" | "oldest";
type StatusFilter = "all" | AdminListingRow["status"];

const selectClass =
  "h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30";

export function AdminListingsTable({ listings }: { listings: AdminListingRow[] }) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings
      .filter((l) => {
        if (categoryFilter !== "all" && l.category_slug !== categoryFilter) return false;
        if (statusFilter !== "all" && l.status !== statusFilter) return false;
        if (!q) return true;
        return l.title.toLowerCase().includes(q) || l.sellerName.toLowerCase().includes(q);
      })
      .sort((a, b) =>
        sort === "newest"
          ? b.created_at.localeCompare(a.created_at)
          : a.created_at.localeCompare(b.created_at),
      );
  }, [listings, query, categoryFilter, statusFilter, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título o vendedor…"
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={selectClass}
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className={selectClass}
        >
          <option value="all">Todos los estados</option>
          <option value="published">Publicado</option>
          <option value="pending">En revisión</option>
          <option value="rejected">Rechazado</option>
          <option value="expired">Expirado</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className={selectClass}
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguos</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center">
          <FileText className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">
            {listings.length === 0
              ? "Todavía no hay anuncios"
              : "Ningún anuncio coincide con la búsqueda"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/40 text-xs font-medium text-muted-foreground">
                  <th className="px-5 py-3 text-left">Anuncio</th>
                  <th className="px-5 py-3 text-left">Vendedor</th>
                  <th className="px-5 py-3 text-left">Categoría</th>
                  <th className="px-5 py-3 text-left">Estado</th>
                  <th className="px-5 py-3 text-right">Precio</th>
                  <th className="px-5 py-3 text-right">👁 / ❤</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                    <td className="max-w-xs px-5 py-3">
                      <Link
                        href={`/anuncios/${l.slug}`}
                        className="block truncate font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {l.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {l.city} · {postedLabel(l.created_at)}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <p>{l.sellerName}</p>
                      <p className="text-xs">{l.sellerEmail}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {categoryName(l.category_slug)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle[l.status]}`}
                      >
                        {statusLabel[l.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground">
                      {l.price != null ? `${formatNumber(Number(l.price))} FCFA` : "—"}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-muted-foreground">
                      {l.views_count} / {l.favorites_count}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DeleteListingButton listingId={l.id} title={l.title} />
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
