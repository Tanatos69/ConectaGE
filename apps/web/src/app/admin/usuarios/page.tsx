import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { getAdminUsers } from "../data";
import { monthYearLabel } from "@/lib/time";

export const metadata: Metadata = { title: "Usuarios" };

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

export default async function AdminUsuariosPage() {
  const users = await getAdminUsers();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {users.length.toLocaleString("es-ES")} cuentas registradas. Los roles de administrador
          se gestionan en Ajustes.
        </p>
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center">
          <Users className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">Todavía no hay usuarios</p>
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
                  <th className="px-5 py-3 text-right">Anuncios</th>
                  <th className="px-5 py-3 text-right">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      {u.listingsCount > 0 ? (
                        <Link
                          href={`/usuario/${u.id}`}
                          className="font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {u.full_name || "—"}
                        </Link>
                      ) : (
                        <span className="font-medium text-foreground">{u.full_name || "—"}</span>
                      )}
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
