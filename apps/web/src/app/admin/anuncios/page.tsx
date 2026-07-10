import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { getAdminListings } from "../data";
import { categories } from "@/lib/categories";
import { formatNumber } from "@/lib/format";
import { postedLabel } from "@/lib/time";
import { DeleteListingButton } from "@/components/admin/admin-row-actions";

export const metadata: Metadata = { title: "Anuncios" };

const statusLabel: Record<string, string> = {
  published: "Publicado",
  pending: "En revisión",
  rejected: "Rechazado",
  expired: "Expirado",
};

const statusStyle: Record<string, string> = {
  published: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
  expired: "bg-muted text-muted-foreground",
};

function categoryName(slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

export default async function AdminAnunciosPage() {
  const listings = await getAdminListings();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Anuncios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {listings.length.toLocaleString("es-ES")} anuncios en la plataforma.
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center">
          <FileText className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">Todavía no hay anuncios</p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/40 text-xs font-medium text-muted-foreground">
                  <th className="px-5 py-3 text-left">Anuncio</th>
                  <th className="px-5 py-3 text-left">Vendedor</th>
                  <th className="px-5 py-3 text-left">Categoría</th>
                  <th className="px-5 py-3 text-left">Estado</th>
                  <th className="px-5 py-3 text-right">Precio</th>
                  <th className="px-5 py-3 text-right">👁 / ❤</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                    <td className="max-w-xs px-5 py-3">
                      <Link
                        href={`/anuncios/${l.slug}`}
                        className="block truncate font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {l.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {l.city} · {postedLabel(l.created_at)}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <p>{l.sellerName}</p>
                      <p className="text-xs">{l.sellerEmail}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {categoryName(l.category_slug)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle[l.status]}`}
                      >
                        {statusLabel[l.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground">
                      {l.price != null ? `${formatNumber(Number(l.price))} FCFA` : "—"}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-muted-foreground">
                      {l.views_count} / {l.favorites_count}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DeleteListingButton listingId={l.id} title={l.title} />
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
