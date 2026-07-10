"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search, Users, Download, Ban, Unlock, X } from "lucide-react";
import { bulkBlockUsersAction, bulkUnblockUsersAction } from "@/lib/actions/admin";
import type { AdminUserRow } from "@/app/admin/data";
import { monthYearLabel } from "@/lib/time";

const roleLabel: Record<string, string> = {
  buyer: "Comprador",
  seller: "Vendedor",
  admin: "Admin",
};

const roleStyle: Record<string, string> = {
  buyer: "bg-secondary text-muted-foreground",
  seller: "bg-primary/10 text-primary",
  admin: "bg-amber-50 text-amber-700",
};

const selectClass =
  "h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30";

type SortKey = "newest" | "oldest" | "most_listings" | "name";

function exportCsv(rows: AdminUserRow[]) {
  const esc = (v: string | number | null) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = ["Nombre", "Email", "Teléfono", "Ciudad", "Rol", "Estado", "Anuncios", "Registro"];
  const lines = rows.map((u) =>
    [
      esc(u.full_name),
      esc(u.email),
      esc(u.phone),
      esc(u.city),
      esc(roleLabel[u.role] ?? u.role),
      esc(u.blocked_at ? "Bloqueada" : "Activa"),
      esc(u.listingsCount),
      esc(u.created_at.slice(0, 10)),
    ].join(","),
  );
  const blob = new Blob(["﻿" + [header.join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `usuarios-conectage-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminUsersTable({ users }: { users: AdminUserRow[] }) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "buyer" | "seller" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [withListings, setWithListings] = useState(false);
  const [sort, setSort] = useState<SortKey>("newest");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkReason, setBulkReason] = useState("");
  const [showBulkBlock, setShowBulkBlock] = useState(false);
  const [bulkError, setBulkError] = useState("");
  const [bulkPending, startBulk] = useTransition();

  const cityOptions = useMemo(
    () =>
      [...new Set(users.map((u) => u.city).filter((c): c is string => Boolean(c)))].sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
    [users],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter === "blocked" && !u.blocked_at) return false;
      if (statusFilter === "active" && u.blocked_at) return false;
      if (cityFilter !== "all" && u.city !== cityFilter) return false;
      if (withListings && u.listingsCount === 0) return false;
      if (fromDate && u.created_at.slice(0, 10) < fromDate) return false;
      if (toDate && u.created_at.slice(0, 10) > toDate) return false;
      if (!q) return true;
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q)
      );
    });
    return list.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.created_at.localeCompare(b.created_at);
        case "most_listings":
          return b.listingsCount - a.listingsCount;
        case "name":
          return a.full_name.localeCompare(b.full_name, "es");
        default:
          return b.created_at.localeCompare(a.created_at);
      }
    });
  }, [users, query, roleFilter, statusFilter, cityFilter, withListings, fromDate, toDate, sort]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const visibleSelected = filtered.filter((u) => selected.has(u.id));
  const allVisibleSelected = filtered.length > 0 && visibleSelected.length === filtered.length;

  function toggleSelectAll() {
    setSelected(allVisibleSelected ? new Set() : new Set(filtered.map((u) => u.id)));
  }

  function runBulkBlock() {
    setBulkError("");
    startBulk(async () => {
      const result = await bulkBlockUsersAction([...selected], bulkReason);
      if (result?.error) {
        setBulkError(result.error);
        return;
      }
      setSelected(new Set());
      setBulkReason("");
      setShowBulkBlock(false);
    });
  }

  function runBulkUnblock() {
    setBulkError("");
    startBulk(async () => {
      const result = await bulkUnblockUsersAction([...selected]);
      if (result?.error) {
        setBulkError(result.error);
        return;
      }
      setSelected(new Set());
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono…"
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
          className={selectClass}
        >
          <option value="all">Todos los roles</option>
          <option value="buyer">Compradores</option>
          <option value="seller">Vendedores</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className={selectClass}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="blocked">Bloqueadas</option>
        </select>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className={selectClass}
        >
          <option value="all">Todas las ciudades</option>
          {cityOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Registro desde
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-2 text-xs"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          hasta
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-2 text-xs"
          />
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={withListings}
            onChange={(e) => setWithListings(e.target.checked)}
            className="size-3.5 rounded border-input"
          />
          Solo con anuncios
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="h-9 rounded-lg border border-input bg-background px-2 text-xs"
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguos</option>
          <option value="most_listings">Más anuncios</option>
          <option value="name">Nombre A–Z</option>
        </select>
        <button
          type="button"
          onClick={() => exportCsv(filtered)}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Download className="size-3.5" />
          Exportar CSV ({filtered.length})
        </button>
      </div>

      {selected.size > 0 && (
        <div className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-foreground">
              {selected.size} usuario{selected.size !== 1 ? "s" : ""} seleccionado
              {selected.size !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => setShowBulkBlock((v) => !v)}
              disabled={bulkPending}
              className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              <Ban className="size-3.5" />
              Bloquear seleccionados
            </button>
            <button
              onClick={runBulkUnblock}
              disabled={bulkPending}
              className="flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary disabled:opacity-50"
            >
              <Unlock className="size-3.5" />
              Desbloquear seleccionados
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary"
            >
              <X className="size-3.5" />
              Limpiar
            </button>
          </div>
          {showBulkBlock && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                placeholder="Motivo del bloqueo…"
                className="h-9 min-w-[240px] flex-1 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none"
              />
              <button
                onClick={runBulkBlock}
                disabled={bulkPending || !bulkReason.trim()}
                className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {bulkPending ? "Bloqueando…" : "Confirmar bloqueo"}
              </button>
            </div>
          )}
          {bulkError && <p className="text-xs text-destructive">{bulkError}</p>}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center">
          <Users className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">
            {users.length === 0 ? "Todavía no hay usuarios" : "Ningún usuario coincide con la búsqueda"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/40 text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      className="size-3.5 rounded border-input"
                      aria-label="Seleccionar todos"
                    />
                  </th>
                  <th className="px-5 py-3 text-left">Usuario</th>
                  <th className="px-5 py-3 text-left">Contacto</th>
                  <th className="px-5 py-3 text-left">Ciudad</th>
                  <th className="px-5 py-3 text-left">Rol</th>
                  <th className="px-5 py-3 text-left">Estado</th>
                  <th className="px-5 py-3 text-right">Anuncios</th>
                  <th className="px-5 py-3 text-right">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(u.id)}
                        onChange={() => toggleSelect(u.id)}
                        className="size-3.5 rounded border-input"
                        aria-label={`Seleccionar ${u.full_name}`}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/usuarios/${u.id}`}
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {u.full_name || "—"}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <p>{u.email}</p>
                      {u.phone && <p className="text-xs">{u.phone}</p>}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{u.city || "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleStyle[u.role]}`}
                      >
                        {roleLabel[u.role]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {u.blocked_at ? (
                        <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                          Bloqueada
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          Activa
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground">
                      {u.listingsCount}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-muted-foreground">
                      {monthYearLabel(u.created_at)}
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
