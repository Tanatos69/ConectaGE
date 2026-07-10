import type { Metadata } from "next";
import Link from "next/link";
import { Flag } from "lucide-react";
import { getAdminReports, type AdminReportRow } from "../data";
import { postedLabel } from "@/lib/time";
import { ListingReportActions, SingleReportActions } from "@/components/admin/admin-row-actions";

export const metadata: Metadata = { title: "Reportes" };

const reasonLabel: Record<string, string> = {
  fraud: "Posible estafa o fraude",
  prohibited: "Artículo prohibido",
  wrong_category: "Categoría incorrecta",
  duplicate: "Anuncio duplicado",
  offensive: "Contenido ofensivo",
  other: "Otro motivo",
};

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  resolved: "Resuelto",
  dismissed: "Descartado",
};

const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  resolved: "bg-green-50 text-green-700",
  dismissed: "bg-muted text-muted-foreground",
};

interface ListingGroup {
  listingSlug: string;
  listingId: string | null;
  listingTitle: string;
  sellerId: string | null;
  sellerName: string;
  sellerEmail: string;
  reports: AdminReportRow[];
  latestAt: string;
}

/** Multiple reporters can flag the same listing — group so an admin sees
 * one listing with N reports instead of N repeats of the same context. */
function groupByListing(reports: AdminReportRow[]): ListingGroup[] {
  const groups = new Map<string, ListingGroup>();
  for (const r of reports) {
    let group = groups.get(r.listing_slug);
    if (!group) {
      group = {
        listingSlug: r.listing_slug,
        listingId: r.listingId,
        listingTitle: r.listingTitle,
        sellerId: r.sellerId,
        sellerName: r.sellerName,
        sellerEmail: r.sellerEmail,
        reports: [],
        latestAt: r.created_at,
      };
      groups.set(r.listing_slug, group);
    }
    group.reports.push(r);
    if (r.created_at > group.latestAt) group.latestAt = r.created_at;
  }
  return Array.from(groups.values());
}

export default async function AdminReportesPage() {
  const reports = await getAdminReports();
  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const closedCount = reports.length - pendingCount;

  const groups = groupByListing(reports).sort((a, b) => {
    const aPending = a.reports.some((r) => r.status === "pending");
    const bPending = b.reports.some((r) => r.status === "pending");
    if (aPending !== bPending) return aPending ? -1 : 1;
    return b.latestAt.localeCompare(a.latestAt);
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""} · {closedCount} cerrado
          {closedCount !== 1 ? "s" : ""} · {groups.length} anuncio{groups.length !== 1 ? "s" : ""}{" "}
          afectado{groups.length !== 1 ? "s" : ""}
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center">
          <Flag className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">No hay reportes</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Los reportes de los usuarios sobre anuncios aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => {
            const anyPending = g.reports.find((r) => r.status === "pending");
            return (
              <div
                key={g.listingSlug}
                className="overflow-hidden rounded-2xl border bg-card shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-muted/30 px-5 py-4">
                  <div className="min-w-0">
                    <Link
                      href={`/anuncios/${g.listingSlug}`}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {g.listingTitle}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {g.reports.length} reporte{g.reports.length !== 1 ? "s" : ""} ·{" "}
                      {g.sellerId ? (
                        <Link
                          href={`/admin/usuarios/${g.sellerId}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {g.sellerName}
                        </Link>
                      ) : (
                        g.sellerName
                      )}{" "}
                      ({g.sellerEmail})
                    </p>
                  </div>
                  {anyPending && g.listingId && (
                    <ListingReportActions
                      listingId={g.listingId}
                      listingTitle={g.listingTitle}
                      anyPendingReportId={anyPending.id}
                    />
                  )}
                </div>

                <div className="divide-y">
                  {g.reports.map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyle[r.status]}`}
                          >
                            {statusLabel[r.status]}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {reasonLabel[r.reason]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {postedLabel(r.created_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Reportado por {r.reporterName} ({r.reporterEmail})
                        </p>
                        {r.details && (
                          <p className="mt-1.5 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                            {r.details}
                          </p>
                        )}
                      </div>
                      {r.status === "pending" && <SingleReportActions reportId={r.id} />}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
