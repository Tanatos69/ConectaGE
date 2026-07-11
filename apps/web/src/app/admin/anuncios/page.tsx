import type { Metadata } from "next";
import { getAdminListings } from "../data";
import { AdminListingsTable } from "@/components/admin/admin-listings-table";
import { MarkSectionSeen } from "@/components/admin/mark-section-seen";

export const metadata: Metadata = { title: "Anuncios" };

export default async function AdminAnunciosPage() {
  const listings = await getAdminListings();

  return (
    <div className="space-y-5">
      <MarkSectionSeen section="listings" />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Anuncios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {listings.length.toLocaleString("es-ES")} anuncios en la plataforma.
        </p>
      </div>
      <AdminListingsTable listings={listings} />
    </div>
  );
}
