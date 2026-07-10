import type { Metadata } from "next";
import { getAdminTiendas } from "../data";
import { AdminTiendasTable } from "@/components/admin/admin-tiendas-table";

export const metadata: Metadata = { title: "Tiendas" };

export default async function AdminTiendasPage() {
  const tiendas = await getAdminTiendas();
  const unverifiedCount = tiendas.filter((t) => !t.verified).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tiendas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tiendas.length.toLocaleString("es-ES")} tienda{tiendas.length !== 1 ? "s" : ""}
          {unverifiedCount > 0 ? ` · ${unverifiedCount} sin verificar` : ""}
        </p>
      </div>
      <AdminTiendasTable tiendas={tiendas} />
    </div>
  );
}
