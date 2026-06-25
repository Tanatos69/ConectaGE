"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Eye, CheckCircle, XCircle, Clock, ShieldCheck } from "lucide-react";
import { adminStores, type AdminStore, type StoreVerificationStatus } from "@/lib/demo-admin";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

const statusLabels: Record<StoreVerificationStatus, string> = {
  verified: "Verificada",
  pending: "Pendiente",
  unverified: "No verificada",
};

const statusClasses: Record<StoreVerificationStatus, string> = {
  verified: "bg-primary/10 text-primary",
  pending: "bg-amber-50 text-amber-700",
  unverified: "bg-slate-100 text-slate-600",
};

export default function AdminTiendasPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StoreVerificationStatus | "all">("all");
  const [stores, setStores] = useState<AdminStore[]>(adminStores);

  const filtered = stores.filter((s) => {
    const matchStatus = statusFilter === "all" || s.verificationStatus === statusFilter;
    const q = query.toLowerCase();
    const matchQuery =
      s.name.toLowerCase().includes(q) ||
      s.ownerUsername.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

  function verify(slug: string) {
    setStores((prev) =>
      prev.map((s) =>
        s.slug === slug ? { ...s, verificationStatus: "verified", pendingVerificationSince: undefined } : s
      )
    );
  }

  function reject(slug: string) {
    setStores((prev) =>
      prev.map((s) =>
        s.slug === slug ? { ...s, verificationStatus: "unverified", nif: undefined, pendingVerificationSince: undefined } : s
      )
    );
  }

  const pendingCount = stores.filter((s) => s.verificationStatus === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tiendas</h1>
          {pendingCount > 0 && (
            <p className="mt-1 text-sm text-amber-600">
              {pendingCount} solicitud{pendingCount > 1 ? "es" : ""} de verificación pendiente{pendingCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
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
          {(["all", "verified", "pending", "unverified"] as const).map((f) => (
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
              {f === "all" ? "Todas" : statusLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-left">Tienda</th>
                <th className="px-4 py-3 text-left">Propietario</th>
                <th className="px-4 py-3 text-left">Ciudad</th>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">NIF</th>
                <th className="px-4 py-3 text-right">Seguidores</th>
                <th className="px-4 py-3 text-right">Anuncios</th>
                <th className="px-4 py-3 text-left">Desde</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((s) => (
                <tr
                  key={s.slug}
                  className={cn(
                    "transition-colors hover:bg-secondary/30",
                    s.verificationStatus === "pending" && "bg-amber-50/30",
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={s.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{s.name}</p>
                        <p className="truncate text-xs text-muted-foreground">/{s.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <Link href={`/usuario/${s.ownerUsername}`} className="hover:text-primary hover:underline">
                      {s.ownerUsername}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.city}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.categoryName}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusClasses[s.verificationStatus])}>
                      {statusLabels[s.verificationStatus]}
                    </span>
                    {s.verificationStatus === "pending" && s.pendingVerificationSince && (
                      <div className="mt-0.5 flex items-center gap-1 text-[10px] text-amber-600">
                        <Clock className="size-3" />
                        Solicitado {s.pendingVerificationSince}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {s.nif ? (
                      <span className={cn(s.verificationStatus === "pending" && "font-semibold text-amber-700")}>
                        {s.nif}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {s.followers.toLocaleString("es")}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{s.listingsCount}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{s.memberSince}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/tienda/${s.slug}`}
                        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                        title="Ver tienda"
                        target="_blank"
                      >
                        <Eye className="size-3.5" />
                      </Link>
                      {s.verificationStatus === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => verify(s.slug)}
                            title="Verificar"
                            className="flex size-7 items-center justify-center rounded-lg text-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => reject(s.slug)}
                            title="Rechazar"
                            className="flex size-7 items-center justify-center rounded-lg text-destructive hover:bg-red-50"
                          >
                            <XCircle className="size-3.5" />
                          </button>
                        </>
                      )}
                      {s.verificationStatus === "verified" && (
                        <span className="flex size-7 items-center justify-center">
                          <ShieldCheck className="size-3.5 text-primary" />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No se encontraron tiendas para los filtros seleccionados.
          </p>
        )}
      </div>
    </div>
  );
}
