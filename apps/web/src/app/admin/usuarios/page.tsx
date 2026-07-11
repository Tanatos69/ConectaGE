import type { Metadata } from "next";
import { getAdminUsers } from "../data";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { MarkSectionSeen } from "@/components/admin/mark-section-seen";

export const metadata: Metadata = { title: "Usuarios" };

export default async function AdminUsuariosPage() {
  const users = await getAdminUsers();

  return (
    <div className="space-y-5">
      <MarkSectionSeen section="users" />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {users.length.toLocaleString("es-ES")} cuentas registradas.
        </p>
      </div>
      <AdminUsersTable users={users} />
    </div>
  );
}
