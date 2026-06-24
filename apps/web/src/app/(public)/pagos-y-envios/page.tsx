import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Truck, Check, Clock, ShieldCheck } from "lucide-react";
import {
  paymentMethods,
  deliveryZones,
  logisticsServices,
} from "@/lib/payments-logistics";

export const metadata: Metadata = {
  title: "Pagos y envíos",
  description:
    "Métodos de pago (Muni Dinero, Rosa Money, BGF Mobile, transferencia) y logística de última milla en Malabo, Bata y todo Guinea Ecuatorial en ConectaGE.",
};

export default function PagosYEnviosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">Pagos y envíos</h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
          Paga como prefieras y recibe tus compras en todo el país. Adaptado al mercado de Guinea
          Ecuatorial.
        </p>
      </div>

      {/* Payment methods */}
      <section className="mb-12">
        <h2 className="mb-1 flex items-center gap-2 text-xl font-bold text-foreground">
          <CreditCard className="size-5 text-primary" />
          Métodos de pago
        </h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Aceptamos los principales medios de pago móviles y bancarios del país.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {paymentMethods.map((m) => (
            <div
              key={m.id}
              className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-sm"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCard className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{m.name}</p>
                  {m.available ? (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-green-700">
                      Disponible
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                      Próximamente
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Logistics */}
      <section className="mb-12">
        <h2 className="mb-1 flex items-center gap-2 text-xl font-bold text-foreground">
          <Truck className="size-5 text-primary" />
          Logística de última milla
        </h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Red de reparto propia con cobertura nacional y plazos orientativos por zona.
        </p>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          {deliveryZones.map((z) => (
            <div key={z.city} className="rounded-2xl border bg-card p-4 text-center shadow-sm">
              <p className="font-semibold text-foreground">{z.city}</p>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-4" />
                {z.eta}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {logisticsServices.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-green-600" />
                <span className="text-muted-foreground">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* WhatsApp coordination note */}
      <section className="mb-10 flex items-start gap-3 rounded-2xl border bg-secondary/50 p-5">
        <ShieldCheck className="size-5 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          La compra y el envío se coordinan directamente con el vendedor por WhatsApp. Acuerda el
          método de pago y la entrega antes de confirmar, y sigue siempre nuestros{" "}
          <Link href="/ayuda" className="font-medium text-primary hover:underline">
            consejos de seguridad
          </Link>
          .
        </p>
      </section>

      <div className="text-center">
        <Link
          href="/buscar"
          className="inline-flex rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          Explorar anuncios
        </Link>
      </div>
    </div>
  );
}
