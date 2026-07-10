import type { Metadata } from "next";
import { getAdminFeaturedRequests } from "../data";
import { AdminDestacadosView } from "@/components/admin/admin-destacados-view";

export const metadata: Metadata = { title: "Destacados" };

export default async function AdminDestacadosPage() {
  const requests = await getAdminFeaturedRequests();

  return <AdminDestacadosView requests={requests} />;
}
