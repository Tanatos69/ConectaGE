"use client";

import { useState } from "react";
import { Check, X, Coins, Wallet } from "lucide-react";
import { useAppState } from "@/lib/store/app-state";
import { creditPacks, type CreditPack } from "@/lib/promotions";
import { paymentMethods } from "@/lib/payments-logistics";
import { cn } from "@/lib/utils";

function xaf(n: number) {
  return `${n.toLocaleString("es")} FCFA`;
}

/**
 * Credit-pack picker with a simulated-payment dialog. Reused on /planes and on
 * the seller credits dashboard. "Paying" instantly tops up the balance and logs
 * a transaction — no real gateway in the demo.
 */
export function CreditPacks({ showBalance = false }: { showBalance?: boolean }) {
  const { credits, buyCredits } = useAppState();
  const [pack, setPack] = useState<CreditPack | null>(null);
  const [method, setMethod] = useState(paymentMethods[0].id);
  const [done, setDone] = useState(false);
  const [newBalance, setNewBalance] = useState(0);

  function open(p: CreditPack) {
    setPack(p);
    setDone(false);
    setMethod(paymentMethods[0].id);
  }

  function pay() {
    if (!pack) return;
    const total = pack.credits + pack.bonus;
    setNewBalance(credits.balance + total);
    buyCredits(total, `Compra de ${total} créditos`);
    setDone(true);
  }

  return (
    <div>
      {showBalance && (
        <div className="mb-5 flex items-center justify-between rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Wallet className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tu saldo</p>
              <p className="text-2xl font-extrabold text-foreground">
                {credits.balance} <span className="text-base font-semibold">créditos</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {creditPacks.map((p) => (
          <div
            key={p.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-card p-5 shadow-sm",
              p.popular && "border-2 border-primary",
            )}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-white">
                MÁS POPULAR
              </span>
            )}
            <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Coins className="size-6" />
            </div>
            <p className="text-3xl font-extrabold text-foreground">
              {p.credits + p.bonus}
              <span className="ml-1 text-sm font-semibold text-muted-foreground">créditos</span>
            </p>
            {p.bonus > 0 && (
              <p className="mt-0.5 text-xs font-semibold text-green-600">
                Incluye +{p.bonus} de regalo
              </p>
            )}
            <p className="mb-4 mt-2 text-lg font-bold text-foreground">{xaf(p.priceXAF)}</p>
            <button
              type="button"
              onClick={() => open(p)}
              className="mt-auto rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Comprar
            </button>
          </div>
        ))}
      </div>

      {/* Buy dialog */}
      {pack && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setPack(null)}
          />
          <div className="relative z-10 w-full max-w-md overflow-y-auto rounded-t-2xl border bg-card p-5 shadow-2xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {done ? "Pago confirmado" : "Confirmar compra"}
              </h2>
              <button
                type="button"
                onClick={() => setPack(null)}
                aria-label="Cerrar"
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
              >
                <X className="size-5" />
              </button>
            </div>

            {done ? (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-green-50">
                  <Check className="size-7 text-green-600" />
                </div>
                <p className="font-semibold text-foreground">
                  +{pack.credits + pack.bonus} créditos añadidos
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nuevo saldo: {newBalance} créditos
                </p>
                <button
                  type="button"
                  onClick={() => setPack(null)}
                  className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
                >
                  Listo
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
                  <span className="text-sm font-medium text-foreground">
                    {pack.credits + pack.bonus} créditos
                  </span>
                  <span className="text-sm font-bold text-foreground">{xaf(pack.priceXAF)}</span>
                </div>

                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Método de pago
                </p>
                <div className="space-y-1.5">
                  {paymentMethods
                    .filter((m) => m.available)
                    .map((m) => (
                      <label
                        key={m.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-colors",
                          method === m.id
                            ? "border-primary bg-primary/5"
                            : "border-input hover:bg-secondary",
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={m.id}
                          checked={method === m.id}
                          onChange={() => setMethod(m.id)}
                          className="accent-primary"
                        />
                        <span className="font-medium text-foreground">{m.name}</span>
                      </label>
                    ))}
                </div>

                <button
                  type="button"
                  onClick={pay}
                  className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  Pagar {xaf(pack.priceXAF)}
                </button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Demostración — no se realiza ningún cobro real.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
