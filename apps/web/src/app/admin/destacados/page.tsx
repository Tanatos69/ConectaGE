"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle, XCircle, Clock } from "lucide-react";
import { featuredRequests, type FeaturedStatus } from "@/lib/demo-admin";
import { cn } from "@/lib/utils";

const planColors: Record<string, string> = {
  "7d": "bg-sky-50 text-sky-700",
  "15d": "bg-violet-50 text-violet-700",
  "30d": "bg-amber-50 text-amber-700",
};

const statusClasses: Record<FeaturedStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-green-50 text-green-700",
  expired: "bg-slate-100 text-slate-600",
  rejected: "bg-red-50 text-destructive",
};

const statusLabels: Record<FeaturedStatus, string> = {
  pending: "Pago pendiente",
  confirmed: "Activo",
  expired: "Expirado",
  rejected: "Rechazado",
};

const planPrices: Record<string, string> = {
  "7d": "5.000 FCFA",
  "15d": "8.000 FCFA",
  "30d": "12.000 FCFA",
};

export default function AdminDestacadosPage() {
  const [requests, setRequests] = useState(featuredRequests);
  const [addingManual, setAddingManual] = useState(false);

  function confirm(id: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "confirmed" as const, activeSince: "13 jun 2025", expiresAt: `${parseInt(r.plan) + 13} jun 2025` }
          : r,
      ),
    );
  }

  function reject(id: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r)));
  }

  function expire(id: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "expired" as const } : r)));
  }

  const pending = requests.filter((r) => r.status === "pending");
  const rest = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Anuncios destacados</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pending.length} solicitud{pending.length !== 1 ? "es" : ""} de pago pendiente{pending.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setAddingManual((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
        >
          <Sparkles className="size-4" />
          Destacar manualmente
        </button>
      </div>

      {/* Manual feature form */}
      {addingManual && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
          <p className="text-sm font-semibold text-foreground">Destacar anuncio sin pago (promoción admin)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">URL del anuncio (slug)</label>
              <input
                type="text"
                placeholder="toyota-rav4-2019-a3f7c2"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Duración</label>
              <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
                <option value="7d">7 días</option>
                <option value="15d">15 días</option>
                <option value="30d">30 días</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAddingManual(false)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Confirmar
            </button>
            <button
              onClick={() => setAddingManual(false)}
              className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Pending payments */}
      {pending.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Pendientes de confirmación</p>
          <div className="grid gap-3 lg:grid-cols-2">
            {pending.map((r) => (
              <div key={r.id} className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/anuncios/${r.listingSlug}`} className="text-sm font-semibold text-primary hover:underline">
                      {r.listingTitle}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">@{r.sellerUsername} · {r.submittedAt}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", planColors[r.plan])}>
                    Plan {r.plan}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Importe</p>
                    <p className="font-semibold text-foreground">{r.price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Método de pago</p>
                    <p className="font-medium text-foreground">{r.paymentMethod}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => confirm(r.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    <CheckCircle className="size-4" />
                    Confirmar pago
                  </button>
                  <button
                    onClick={() => reject(r.id)}
                    className="flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white hover:bg-destructive/90"
                  >
                    <XCircle className="size-4" />
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History table */}
      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">Historial</p>
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Anuncio</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Vendedor</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Plan</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Estado</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Vigencia</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rest.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/anuncios/${r.listingSlug}`} className="font-medium text-primary hover:underline">
                        {r.listingTitle}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">@{r.sellerUsername}</td>
                    <td className="px-5 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", planColors[r.plan])}>
                        {r.plan} · {planPrices[r.plan]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusClasses[r.status])}>
                        {statusLabels[r.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {r.activeSince && r.expiresAt ? (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {r.activeSince} → {r.expiresAt}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      {r.status === "confirmed" && (
                        <button
                          onClick={() => expire(r.id)}
                          className="rounded-lg border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary"
                        >
                          Expirar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
