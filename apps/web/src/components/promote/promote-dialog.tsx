"use client";

import { useState, useTransition } from "react";
import { X, Check, Star, Landmark, Smartphone } from "lucide-react";
import { requestFeaturedAction, type FeaturedPlanDays } from "@/lib/actions/featured";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const PLANS: { days: FeaturedPlanDays; label: string; highlight?: boolean }[] = [
  { days: 7, label: "7 días" },
  { days: 15, label: "15 días", highlight: true },
  { days: 30, label: "30 días" },
];

/**
 * "Destacar mi anuncio": the seller picks a plan and payment method, which
 * creates a pending featured_request. The admin confirms the (offline)
 * payment in /admin/destacados and the listing becomes featured for real —
 * no fake credits involved.
 */
export function PromoteDialog({
  listingId,
  title,
  prices,
  paymentInstructions,
  onClose,
}: {
  listingId: string;
  title: string;
  prices: Record<FeaturedPlanDays, number>;
  paymentInstructions: string;
  onClose: () => void;
}) {
  const [plan, setPlan] = useState<FeaturedPlanDays>(15);
  const [method, setMethod] = useState<"bank_transfer" | "mobile_money">("mobile_money");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    setError("");
    startTransition(async () => {
      const result = await requestFeaturedAction(listingId, plan, method);
      if (result?.error) setError(result.error);
      else setDone(true);
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border bg-card p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Destacar anuncio</h2>
            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
          >
            <X className="size-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-green-50">
              <Check className="size-7 text-green-600" />
            </div>
            <p className="font-semibold text-foreground">¡Solicitud enviada!</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Realiza el pago siguiendo las instrucciones y tu anuncio aparecerá destacado en
              cuanto confirmemos el pago (normalmente en menos de 24 h).
            </p>
            <div className="mt-4 w-full rounded-xl bg-secondary p-4 text-left text-sm text-foreground">
              {paymentInstructions}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Entendido
            </button>
          </div>
        ) : (
          <>
            {/* Plan picker */}
            <div className="grid grid-cols-3 gap-2.5">
              {PLANS.map((p) => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => setPlan(p.days)}
                  className={cn(
                    "relative rounded-xl border p-3 text-center transition-colors",
                    plan === p.days
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : "hover:bg-secondary",
                  )}
                >
                  {p.highlight && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                      Popular
                    </span>
                  )}
                  <Star
                    className={cn(
                      "mx-auto size-5",
                      plan === p.days ? "fill-amber-400 text-amber-500" : "text-muted-foreground",
                    )}
                  />
                  <p className="mt-1.5 text-sm font-semibold text-foreground">{p.label}</p>
                  <p className="text-xs font-bold text-primary">
                    {formatNumber(prices[p.days])} FCFA
                  </p>
                </button>
              ))}
            </div>

            {/* Payment method */}
            <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Método de pago
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMethod("mobile_money")}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border p-3 text-sm font-medium transition-colors",
                  method === "mobile_money"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                    : "hover:bg-secondary",
                )}
              >
                <Smartphone className="size-4 text-primary" />
                Dinero móvil
              </button>
              <button
                type="button"
                onClick={() => setMethod("bank_transfer")}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border p-3 text-sm font-medium transition-colors",
                  method === "bank_transfer"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                    : "hover:bg-secondary",
                )}
              >
                <Landmark className="size-4 text-primary" />
                Transferencia
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-secondary p-4 text-xs leading-relaxed text-muted-foreground">
              {paymentInstructions}
            </div>

            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {pending
                ? "Enviando…"
                : `Solicitar destacado · ${formatNumber(prices[plan])} FCFA`}
            </button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              El anuncio se destaca cuando confirmamos el pago.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
