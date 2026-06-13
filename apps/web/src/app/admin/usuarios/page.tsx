"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Shield, Ban, Trash2, Eye, Download, CheckCircle } from "lucide-react";
import { adminUsers, type UserRole, type UserStatus } from "@/lib/demo-admin";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

const roleLabels: Record<UserRole, string> = {
  subscriber: "Suscriptor",
  verified_seller: "Vendedor verificado",
  moderator: "Moderador",
  super_admin: "Super Admin",
};

const roleClasses: Record<UserRole, string> = {
  subscriber: "bg-slate-100 text-slate-700",
  verified_seller: "bg-blue-50 text-blue-700",
  moderator: "bg-violet-50 text-violet-700",
  super_admin: "bg-amber-50 text-amber-700",
};

const statusClasses: Record<UserStatus, string> = {
  active: "bg-green-50 text-green-700",
  banned: "bg-red-50 text-destructive",
};

const roleOptions: UserRole[] = ["subscriber", "verified_seller", "moderator"];

export default function AdminUsuariosPage() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [users, setUsers] = useState(adminUsers);

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    const q = query.toLowerCase();
    const matchQuery = u.name.toLowerCase().includes(q) || u.username.includes(q) || u.email.includes(q) || u.phone.includes(q);
    return matchRole && matchStatus && matchQuery;
  });

  function toggleBan(id: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "active" ? "banned" : "active" } : u,
      ),
    );
  }

  function changeRole(id: string, role: UserRole) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  }

  function deleteUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
        <button className="flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary">
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
            placeholder="Nombre, usuario, email o teléfono..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
        >
          <option value="all">Todos los roles</option>
          {(Object.keys(roleLabels) as UserRole[]).map((r) => (
            <option key={r} value={r}>{roleLabels[r]}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as UserStatus | "all")}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="banned">Baneado</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuario</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contacto</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ciudad</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rol</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Anuncios</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Registro</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className={cn("transition-colors hover:bg-muted/30", u.status === "banned" && "opacity-60")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.name} size="sm" />
                        <div>
                          <p className="font-medium text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-muted-foreground">{u.phone}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.city}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                        disabled={u.role === "super_admin"}
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold border-0 cursor-pointer focus:outline-none",
                          roleClasses[u.role],
                          u.role === "super_admin" && "cursor-default",
                        )}
                      >
                        {roleOptions.map((r) => (
                          <option key={r} value={r}>{roleLabels[r]}</option>
                        ))}
                        {u.role === "super_admin" && <option value="super_admin">{roleLabels.super_admin}</option>}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusClasses[u.status])}>
                        {u.status === "active" ? "Activo" : "Baneado"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{u.activeListings}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{u.registeredAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/usuario/${u.username}`}
                          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="Ver perfil"
                        >
                          <Eye className="size-3.5" />
                        </Link>
                        {u.role !== "super_admin" && (
                          <>
                            <button
                              onClick={() => toggleBan(u.id)}
                              className={cn(
                                "flex size-7 items-center justify-center rounded-lg",
                                u.status === "active"
                                  ? "text-muted-foreground hover:bg-red-50 hover:text-destructive"
                                  : "text-green-600 hover:bg-green-50"
                              )}
                              title={u.status === "active" ? "Banear" : "Desbanear"}
                            >
                              {u.status === "active" ? <Ban className="size-3.5" /> : <CheckCircle className="size-3.5" />}
                            </button>
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-destructive"
                              title="Eliminar cuenta"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </>
                        )}
                        {u.role === "super_admin" && (
                          <Shield className="size-4 text-amber-500 mx-1" aria-label="Super Admin protegido" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t px-5 py-3 text-xs text-muted-foreground">
          Mostrando {filtered.length} de {users.length} usuarios
        </div>
      </div>
    </div>
  );
}
