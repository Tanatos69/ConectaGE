"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  confirmFeaturedRequestAction,
  rejectFeaturedRequestAction,
  expireFeaturedListingAction,
  manuallyFeatureListingAction,
} from "@/lib/actions/admin";
import type { AdminFeaturedRequestRow } from "@/app/admin/data";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const planColors: Record<number, string> = {
  7: "bg-sky-50 text-sky-700",
  15: "bg-violet-50 text-violet-700",
  30: "bg-amber-50 text-amber-700",
};

const statusClasses: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-green-50 text-green-700",
  expired: "bg-slate-100 text-slate-600",
  rejected: "bg-red-50 text-destructive",
};

const statusLabels: Record<string, string> = {
  pending: "Pago pendiente",
  confirmed: "Activo",
  expired: "Expirado",
  rejected: "Rechazado",
};

const paymentMethodLabels: Record<string, string> = {
  bank_transfer: "Transferencia bancaria",
  mobile_money: "Dinero móvil",
  admin_manual: "Promoción admin",
};

/** Matches the site-wide plan pricing (planes page) — informational, since
 * payment confirmation stays manual (no gateway integration this pass). */
const planPrices: Record<number, string> = {
  7: "5.000 FCFA",
  15: "8.000 FCFA",
  30: "12.000 FCFA",
};

function useAction() {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  function run(fn: () => Promise<{ error?: string }>) {
    setError("");
    startTransition(async () => {
      const result = await fn();
      if (result?.error) setError(result.error);
    });
  }
  return { error, pending, run };
}

function RequestActions({ request }: { request: AdminFeaturedRequestRow }) {
  const { error, pending, run } = useAction();
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => run(() => confirmFeaturedRequestAction(request.id))}
          disabled={pending}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          <CheckCircle className="size-4" />
          Confirmar pago
        </button>
        <button
          onClick={() => run(() => rejectFeaturedRequestAction(request.id))}
          disabled={pending}
          className="flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white hover:bg-destructive/90 disabled:opacity-50"
        >
          <XCircle className="size-4" />
          Rechazar
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ExpireButton({ requestId }: { requestId: string }) {
  const { error, pending, run } = useAction();
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => run(() => expireFeaturedListingAction(requestId))}
        disabled={pending}
        className="rounded-lg border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary disabled:opacity-50"
      >
        {pending ? "Expirando…" : "Expirar"}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ManualFeatureForm({ onDone }: { onDone: () => void }) {
  const [slug, setSlug] = useState("");
  const [planDays, setPlanDays] = useState<7 | 15 | 30>(7);
  const { error, pending, run } = useAction();

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold text-foreground">
        Destacar anuncio sin pago (promoción admin)
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            URL del anuncio (slug)
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="toyota-rav4-2019-a3f7c2"
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Duración
          </label>
          <select
            value={planDays}
            onChange={(e) => setPlanDays(Number(e.target.value) as 7 | 15 | 30)}
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            <option value={7}>7 días</option>
            <option value={15}>15 días</option>
            <option value={30}>30 días</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => run(() => manuallyFeatureListingAction(slug, planDays))}
          disabled={pending || !slug.trim()}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Destacando…" : "Confirmar"}
        </button>
        <button
          onClick={onDone}
          className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
        >
          Cancelar
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function AdminDestacadosView({ requests }: { requests: AdminFeaturedRequestRow[] }) {
  const [addingManual, setAddingManual] = useState(false);
  const pending = requests.filter((r) => r.status === "pending");
  const rest = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Anuncios destacados</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pending.length} solicitud{pending.length !== 1 ? "es" : ""} de pago pendiente
            {pending.length !== 1 ? "s" : ""}
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

      {addingManual && <ManualFeatureForm onDone={() => setAddingManual(false)} />}

      {pending.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Pendientes de confirmación</p>
          <div className="grid gap-3 lg:grid-cols-2">
            {pending.map((r) => (
              <div key={r.id} className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/anuncios/${r.listingSlug}`}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {r.listingTitle}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {r.sellerName} ({r.sellerEmail})
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                      planColors[r.plan_days],
                    )}
                  >
                    Plan {r.plan_days}d
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Importe</p>
                    <p className="font-semibold text-foreground">
                      {r.amount != null ? `${formatNumber(r.amount)} ${r.currency}` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Método de pago</p>
                    <p className="font-medium text-foreground">
                      {paymentMethodLabels[r.payment_method]}
                    </p>
                  </div>
                </div>
                <RequestActions request={r} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">Historial</p>
        {rest.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center">
            <Sparkles className="mb-3 size-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">Todavía no hay historial</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
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
                    <tr key={r.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-5 py-3">
                        <Link
                          href={`/anuncios/${r.listingSlug}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {r.listingTitle}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{r.sellerName}</td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-semibold",
                            planColors[r.plan_days],
                          )}
                        >
                          {r.plan_days}d · {planPrices[r.plan_days]}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-semibold",
                            statusClasses[r.status],
                          )}
                        >
                          {statusLabels[r.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {r.starts_at && r.ends_at ? (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(r.starts_at).toLocaleDateString("es-ES")} →{" "}
                            {new Date(r.ends_at).toLocaleDateString("es-ES")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {r.status === "confirmed" && <ExpireButton requestId={r.id} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
