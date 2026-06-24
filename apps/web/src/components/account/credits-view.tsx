"use client";

import Link from "next/link";
import { Star, ArrowUpRight, ArrowDownLeft, ReceiptText } from "lucide-react";
import { useAppState } from "@/lib/store/app-state";
import { CreditPacks } from "@/components/promote/credit-packs";
import { getListingBySlug } from "@/lib/listings";

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CreditsView() {
  const { credits, hydrated } = useAppState();

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-2xl border bg-secondary/60" />;
  }

  const promoted = credits.promoted
    .map((slug) => getListingBySlug(slug))
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Créditos y promociones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compra créditos para destacar tus anuncios y llegar a más compradores.
        </p>
      </div>

      <CreditPacks showBalance />

      {/* Active promotions */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-foreground">Anuncios destacados</h2>
        {promoted.length > 0 ? (
          <div className="space-y-2">
            {promoted.map(
              (l) =>
                l && (
                  <Link
                    key={l.slug}
                    href={`/anuncios/${l.slug}`}
                    className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm transition-colors hover:bg-secondary/40"
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-amber-50">
                      <Star className="size-4 fill-amber-400 text-amber-500" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                      {l.title}
                    </span>
                    <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                      Destacado
                    </span>
                  </Link>
                ),
            )}
          </div>
        ) : (
          <p className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground shadow-sm">
            Aún no tienes anuncios destacados. Ve a{" "}
            <Link href="/mi-cuenta/anuncios" className="font-medium text-primary hover:underline">
              Mis anuncios
            </Link>{" "}
            y pulsa &ldquo;Destacar&rdquo;.
          </p>
        )}
      </section>

      {/* Transaction history */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
          <ReceiptText className="size-4 text-muted-foreground" />
          Historial de movimientos
        </h2>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          {credits.transactions.map((tx, i) => (
            <div
              key={tx.id}
              className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t" : ""}`}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-lg ${
                  tx.amount >= 0 ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-600"
                }`}
              >
                {tx.amount >= 0 ? (
                  <ArrowDownLeft className="size-4" />
                ) : (
                  <ArrowUpRight className="size-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{tx.label}</p>
                <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
              </div>
              <span
                className={`shrink-0 text-sm font-bold ${
                  tx.amount >= 0 ? "text-green-600" : "text-rose-600"
                }`}
              >
                {tx.amount >= 0 ? "+" : ""}
                {tx.amount} créd.
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
