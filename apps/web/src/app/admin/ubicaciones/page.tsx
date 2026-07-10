import type { Metadata } from "next";
import { getAdminLocationTree } from "../data";
import { AdminLocationsTree } from "@/components/admin/admin-locations-tree";

export const metadata: Metadata = { title: "Ubicaciones" };

export default async function AdminUbicacionesPage() {
  const tree = await getAdminLocationTree();

  return <AdminLocationsTree tree={tree} />;
}
