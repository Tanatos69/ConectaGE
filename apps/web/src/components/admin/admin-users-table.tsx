"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
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

export function AdminUsersTable({ users }: { users: AdminUserRow[] }) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "buyer" | "seller" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter === "blocked" && !u.blocked_at) return false;
      if (statusFilter === "active" && u.blocked_at) return false;
      if (!q) return true;
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q)
      );
    });
  }, [users, query, roleFilter, statusFilter]);

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
      </div>

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
