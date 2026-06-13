"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Eye, Edit, Trash2, Download } from "lucide-react";
import { adminListings, type ListingStatus } from "@/lib/demo-admin";
import { cn } from "@/lib/utils";

const tabs: { label: string; value: ListingStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Publicados", value: "published" },
  { label: "Pendientes", value: "pending" },
  { label: "Rechazados", value: "rejected" },
  { label: "Expirados", value: "expired" },
];

const statusClasses: Record<ListingStatus, string> = {
  published: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-destructive",
  expired: "bg-slate-100 text-slate-600",
};
const statusLabels: Record<ListingStatus, string> = {
  published: "Publicado",
  pending: "Pendiente",
  rejected: "Rechazado",
  expired: "Expirado",
};

const categories = ["Todas", "Vehículos", "Inmobiliaria", "Electrónica", "Moda", "Servicios"];

export default function AdminAnunciosPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ListingStatus | "all">("all");
  const [category, setCategory] = useState("Todas");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [listings, setListings] = useState(adminListings);

  const filtered = listings.filter((l) => {
    const matchStatus = activeTab === "all" || l.status === activeTab;
    const matchCat = category === "Todas" || l.category === category;
    const matchQuery = l.title.toLowerCase().includes(query.toLowerCase()) || l.username.includes(query.toLowerCase());
    return matchStatus && matchCat && matchQuery;
  });

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function deleteSelected() {
    setListings((prev) => prev.filter((l) => !selected.has(l.id)));
    setSelected(new Set());
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Anuncios</h1>
        <button
          className="flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
        >
          <Download className="size-4" />
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por título o usuario..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
        >
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto border-b pb-0.5">
        {tabs.map((t) => {
          const count = t.value === "all" ? listings.length : listings.filter((l) => l.status === t.value).length;
          return (
            <button
              key={t.value}
              onClick={() => setActiveTab(t.value)}
              className={cn(
                "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === t.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3">
          <span className="text-sm font-medium">{selected.size} seleccionado{selected.size > 1 ? "s" : ""}</span>
          <button
            onClick={deleteSelected}
            className="flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-white hover:bg-destructive/90"
          >
            <Trash2 className="size-3.5" />
            Eliminar
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={(e) => setSelected(e.target.checked ? new Set(filtered.map((l) => l.id)) : new Set())}
                    className="size-4 accent-primary rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Anuncio</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuario</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoría</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Precio</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Vistas</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No se encontraron anuncios.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(l.id)}
                        onChange={() => toggleSelect(l.id)}
                        className="size-4 accent-primary rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image src={l.image} alt={l.title} fill className="object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/demo/placeholder.jpg"; }} />
                        </div>
                        <span className="max-w-[160px] truncate font-medium text-foreground">{l.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">@{l.username}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.category}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusClasses[l.status])}>
                        {statusLabels[l.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{l.price}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{l.views.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{l.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/anuncios/${l.slug}`}
                          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="Ver"
                        >
                          <Eye className="size-3.5" />
                        </Link>
                        <button
                          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="Editar"
                        >
                          <Edit className="size-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setListings((prev) => prev.filter((x) => x.id !== l.id));
                            setSelected((prev) => { const s = new Set(prev); s.delete(l.id); return s; });
                          }}
                          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-destructive"
                          title="Eliminar"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="border-t px-5 py-3 text-xs text-muted-foreground">
            Mostrando {filtered.length} de {listings.length} anuncios
          </div>
        )}
      </div>
    </div>
  );
}
