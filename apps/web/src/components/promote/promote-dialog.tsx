"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Check, Wallet, CircleAlert } from "lucide-react";
import { useAppState } from "@/lib/store/app-state";
import { promotionOptions } from "@/lib/promotions";
import { cn } from "@/lib/utils";

/**
 * Modal to boost one of the user's listings by spending credits. Parent mounts
 * it only while open. On success the slug is added to `credits.promoted`, so the
 * listing renders with featured styling everywhere via `ListingCard`.
 */
export function PromoteDialog({
  slug,
  title,
  onClose,
}: {
  slug: string;
  title: string;
  onClose: () => void;
}) {
  const { credits, spendCredits, isPromoted } = useAppState();
  const [done, setDone] = useState<string | null>(null);
  const alreadyPromoted = isPromoted(slug);

  function handlePromote(name: string, cost: number) {
    const ok = spendCredits(cost, `${name} — ${title}`, slug);
    if (ok) setDone(name);
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
            <h2 className="text-lg font-bold text-foreground">Promocionar anuncio</h2>
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

        {/* Balance */}
        <div className="mb-4 flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Wallet className="size-4 text-primary" />
            Tu saldo
          </span>
          <span className="text-sm font-bold text-foreground">
            {credits.balance} créditos
          </span>
        </div>

        {done ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-green-50">
              <Check className="size-7 text-green-600" />
            </div>
            <p className="font-semibold text-foreground">¡Anuncio promocionado!</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Aplicaste &ldquo;{done}&rdquo;. Tu anuncio ya aparece destacado.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Listo
            </button>
          </div>
        ) : alreadyPromoted ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-amber-50">
              <CircleAlert className="size-7 text-amber-500" />
            </div>
            <p className="font-semibold text-foreground">Este anuncio ya está destacado</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Puedes volver a promocionarlo cuando termine el período actual.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-xl border border-input px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2.5">
              {promotionOptions.map((opt) => {
                const Icon = opt.icon;
                const affordable = credits.balance >= opt.credits;
                return (
                  <div
                    key={opt.id}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3.5",
                      opt.highlight ? "border-amber-300/70 bg-amber-50/40" : "bg-card",
                    )}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{opt.name}</p>
                        <span className="shrink-0 text-xs font-bold text-primary">
                          {opt.credits} créd.
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{opt.description}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">{opt.durationLabel}</span>
                        <button
                          type="button"
                          disabled={!affordable}
                          onClick={() => handlePromote(opt.name, opt.credits)}
                          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {affordable ? "Aplicar" : "Saldo insuficiente"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="/mi-cuenta/creditos"
              onClick={onClose}
              className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-input py-2.5 text-sm font-semibold text-primary hover:bg-secondary"
            >
              <Wallet className="size-4" />
              Comprar más créditos
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
