import type { Metadata } from "next";
import Link from "next/link";
import { Flag } from "lucide-react";
import { getAdminReports } from "../data";
import { postedLabel } from "@/lib/time";
import { ReportActions } from "@/components/admin/admin-row-actions";

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

export default async function AdminReportesPage() {
  const reports = await getAdminReports();
  const pending = reports.filter((r) => r.status === "pending");
  const closed = reports.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pending.length} pendiente{pending.length !== 1 ? "s" : ""} ·{" "}
          {closed.length} cerrado{closed.length !== 1 ? "s" : ""}
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center">
          <Flag className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">No hay reportes</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Los reportes de los usuarios sobre anuncios aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...pending, ...closed].map((r) => (
            <div key={r.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle[r.status]}`}
                    >
                      {statusLabel[r.status]}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {reasonLabel[r.reason]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {postedLabel(r.created_at)}
                    </span>
                  </div>
                  <Link
                    href={`/anuncios/${r.listing_slug}`}
                    className="mt-1 inline-block text-sm font-medium text-primary hover:underline"
                  >
                    {r.listingTitle}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Reportado por {r.reporterName} ({r.reporterEmail})
                  </p>
                  {r.details && (
                    <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                      {r.details}
                    </p>
                  )}
                </div>
                {r.status === "pending" && (
                  <ReportActions reportId={r.id} listingTitle={r.listingTitle} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
