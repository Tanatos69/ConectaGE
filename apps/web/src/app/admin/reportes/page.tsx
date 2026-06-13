"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag, AlertTriangle, CheckCircle, XCircle, Ban } from "lucide-react";
import { listingReports, userReports, type ReportStatus, type ListingReport, type UserReport } from "@/lib/demo-admin";
import { cn } from "@/lib/utils";

const reasonLabels: Record<string, string> = {
  spam: "Spam",
  fraud: "Fraude o estafa",
  prohibited_item: "Artículo prohibido",
  duplicate: "Anuncio duplicado",
  offensive: "Contenido ofensivo",
  wrong_category: "Categoría incorrecta",
  harassment: "Acoso",
};

const statusClasses: Record<ReportStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  resolved: "bg-green-50 text-green-700",
  dismissed: "bg-slate-100 text-slate-600",
};
const statusLabels: Record<ReportStatus, string> = {
  pending: "Pendiente",
  resolved: "Resuelto",
  dismissed: "Descartado",
};

function ListingReportCard({ report, onAction }: {
  report: ListingReport;
  onAction: (id: string, action: "resolve" | "dismiss" | "ban") => void;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-red-50">
            <Flag className="size-4 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{report.listingTitle}</p>
            <p className="text-xs text-muted-foreground">Vendedor: @{report.sellerName}</p>
          </div>
        </div>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", statusClasses[report.status])}>
          {statusLabels[report.status]}
        </span>
      </div>

      <div className="rounded-xl bg-muted/50 px-4 py-3 space-y-1">
        <p className="text-xs font-semibold text-destructive">{reasonLabels[report.reason]}</p>
        <p className="text-sm text-muted-foreground">{report.details}</p>
        <p className="text-xs text-muted-foreground">Reportado por {report.reporterName} · {report.date}</p>
      </div>

      {report.sellerActiveReports > 1 && (
        <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-xs font-medium text-orange-700">
          <AlertTriangle className="size-3.5" />
          Este vendedor tiene {report.sellerActiveReports} reportes activos
        </div>
      )}

      {report.status === "pending" && (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/anuncios/${report.listingSlug}`}
            className="rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
          >
            Ver anuncio
          </Link>
          <button
            onClick={() => onAction(report.id, "resolve")}
            className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
          >
            <CheckCircle className="size-3.5" />
            Resolver
          </button>
          <button
            onClick={() => onAction(report.id, "ban")}
            className="flex items-center gap-1.5 rounded-xl bg-destructive px-3 py-2 text-xs font-semibold text-white hover:bg-destructive/90"
          >
            <Ban className="size-3.5" />
            Banear vendedor
          </button>
          <button
            onClick={() => onAction(report.id, "dismiss")}
            className="flex items-center gap-1.5 rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
          >
            <XCircle className="size-3.5" />
            Descartar
          </button>
        </div>
      )}
    </div>
  );
}

function UserReportCard({ report, onAction }: {
  report: UserReport;
  onAction: (id: string, action: "resolve" | "dismiss" | "ban") => void;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-50">
            <AlertTriangle className="size-4 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{report.reportedName}</p>
            <p className="text-xs text-muted-foreground">@{report.reportedUsername}</p>
          </div>
        </div>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", statusClasses[report.status])}>
          {statusLabels[report.status]}
        </span>
      </div>

      <div className="rounded-xl bg-muted/50 px-4 py-3 space-y-1">
        <p className="text-xs font-semibold text-orange-700">{reasonLabels[report.reason]}</p>
        <p className="text-sm text-muted-foreground">{report.details}</p>
        <p className="text-xs text-muted-foreground">Reportado por {report.reporterName} · {report.date}</p>
      </div>

      {report.status === "pending" && (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/usuario/${report.reportedUsername}`}
            className="rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
          >
            Ver perfil
          </Link>
          <button
            onClick={() => onAction(report.id, "ban")}
            className="flex items-center gap-1.5 rounded-xl bg-destructive px-3 py-2 text-xs font-semibold text-white hover:bg-destructive/90"
          >
            <Ban className="size-3.5" />
            Banear usuario
          </button>
          <button
            onClick={() => onAction(report.id, "resolve")}
            className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
          >
            <CheckCircle className="size-3.5" />
            Resolver
          </button>
          <button
            onClick={() => onAction(report.id, "dismiss")}
            className="flex items-center gap-1.5 rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
          >
            Descartar
          </button>
        </div>
      )}
    </div>
  );
}

type Tab = "listings" | "users";

export default function AdminReportesPage() {
  const [tab, setTab] = useState<Tab>("listings");
  const [lReports, setLReports] = useState(listingReports);
  const [uReports, setUReports] = useState(userReports);

  function handleListingAction(id: string, action: "resolve" | "dismiss" | "ban") {
    setLReports((prev) =>
      prev.map((r) => r.id === id ? {
        ...r,
        status: action === "dismiss" ? "dismissed" : "resolved"
      } : r)
    );
  }

  function handleUserAction(id: string, action: "resolve" | "dismiss" | "ban") {
    setUReports((prev) =>
      prev.map((r) => r.id === id ? {
        ...r,
        status: action === "dismiss" ? "dismissed" : "resolved"
      } : r)
    );
  }

  const pendingL = lReports.filter((r) => r.status === "pending").length;
  const pendingU = uReports.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-foreground">Reportes</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => setTab("listings")}
          className={cn(
            "border-b-2 px-5 py-3 text-sm font-medium transition-colors",
            tab === "listings" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          Anuncios reportados
          {pendingL > 0 && (
            <span className="ml-2 inline-flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
              {pendingL}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("users")}
          className={cn(
            "border-b-2 px-5 py-3 text-sm font-medium transition-colors",
            tab === "users" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          Usuarios reportados
          {pendingU > 0 && (
            <span className="ml-2 inline-flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
              {pendingU}
            </span>
          )}
        </button>
      </div>

      {tab === "listings" && (
        <div className="grid gap-4 lg:grid-cols-2">
          {lReports.length === 0 ? (
            <p className="col-span-2 py-10 text-center text-sm text-muted-foreground">No hay reportes de anuncios.</p>
          ) : (
            lReports.map((r) => (
              <ListingReportCard key={r.id} report={r} onAction={handleListingAction} />
            ))
          )}
        </div>
      )}

      {tab === "users" && (
        <div className="grid gap-4 lg:grid-cols-2">
          {uReports.length === 0 ? (
            <p className="col-span-2 py-10 text-center text-sm text-muted-foreground">No hay reportes de usuarios.</p>
          ) : (
            uReports.map((r) => (
              <UserReportCard key={r.id} report={r} onAction={handleUserAction} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
