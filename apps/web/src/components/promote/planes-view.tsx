"use client";

import Link from "next/link";
import { Star, Landmark, Smartphone, BadgeCheck } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const faq = [
  {
    q: "¿Cómo destaco mi anuncio?",
    a: "Desde 'Mi cuenta → Mis anuncios', pulsa 'Destacar' en el anuncio que quieras promocionar, elige el plan y el método de pago. Recibirás las instrucciones de pago al momento.",
  },
  {
    q: "¿Qué métodos de pago aceptáis?",
    a: "Dinero móvil (Muni Dinero) y transferencia bancaria (BANGE). Envía el comprobante por WhatsApp y confirmamos tu destacado, normalmente en menos de 24 horas.",
  },
  {
    q: "¿Cuándo empieza a contar el período de destacado?",
    a: "El período comienza cuando confirmamos tu pago, no cuando envías la solicitud.",
  },
  {
    q: "¿Puedo destacar cualquier anuncio?",
    a: "Sí, siempre que el anuncio esté publicado y cumpla nuestros términos. Los anuncios en revisión no pueden destacarse hasta ser aprobados.",
  },
];

export function PlanesView({
  prices,
  paymentInstructions,
  whatsapp,
}: {
  prices: Record<7 | 15 | 30, number>;
  paymentInstructions: string;
  whatsapp: string;
}) {
  const waBase = `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=`;

  const plans: { days: 7 | 15 | 30; name: string; popular?: boolean; blurb: string }[] = [
    { days: 7, name: "Impulso", blurb: "Para vender artículos concretos rápido." },
    { days: 15, name: "Visibilidad", popular: true, blurb: "El equilibrio perfecto entre precio y alcance." },
    { days: 30, name: "Máximo alcance", blurb: "Para vehículos, inmuebles y ventas importantes." },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">Destaca tu anuncio</h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
          Llega a más compradores y vende más rápido. Sin suscripciones: pagas solo por el
          anuncio que quieres destacar.
        </p>
      </div>

      {/* Plans */}
      <section className="mb-14">
        <div className="grid gap-5 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.days}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm",
                plan.popular && "border-2 border-primary",
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-white">
                  RECOMENDADO
                </span>
              )}
              <div className="mb-2 flex items-center gap-2">
                <Star className="size-5 fill-amber-400 text-amber-500" />
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              </div>
              <p className="text-2xl font-extrabold text-foreground">
                {formatNumber(prices[plan.days])} <span className="text-sm font-semibold">FCFA</span>
              </p>
              <p className="mt-0.5 text-sm font-medium text-primary">{plan.days} días destacado</p>
              <p className="mb-6 mt-3 flex-1 text-sm text-muted-foreground">{plan.blurb}</p>
              <Link
                href="/mi-cuenta/anuncios"
                className={cn(
                  "rounded-xl py-2.5 text-center text-sm font-semibold transition-colors",
                  plan.popular
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "border border-primary text-primary hover:bg-primary hover:text-white",
                )}
              >
                Destacar un anuncio
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How to pay */}
      <section className="mb-14 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-foreground">Cómo pagar</h2>
        <div className="mb-4 flex flex-wrap gap-3">
          <span className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-foreground">
            <Smartphone className="size-4 text-primary" />
            Dinero móvil
          </span>
          <span className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-foreground">
            <Landmark className="size-4 text-primary" />
            Transferencia bancaria
          </span>
          <span className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-foreground">
            <BadgeCheck className="size-4 text-green-600" />
            Confirmación en menos de 24 h
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{paymentInstructions}</p>
      </section>

      {/* What "featured" means */}
      <section className="mb-12 rounded-2xl border bg-secondary/50 p-6">
        <h2 className="mb-3 text-lg font-bold text-foreground">
          ¿Qué significa &ldquo;Destacado&rdquo;?
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Los anuncios destacados aparecen con un borde dorado y la etiqueta{" "}
          <strong className="inline-flex items-center gap-1 text-foreground">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            Destacado
          </strong>{" "}
          en las páginas de categoría y búsqueda, y en la sección especial de la página de inicio.
          Esto les da una visibilidad mucho mayor que a los anuncios normales. Un anuncio normal
          puede esperar días para recibir contactos; uno destacado suele recibirlos en horas.
        </p>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="mb-5 text-xl font-bold text-foreground">Preguntas frecuentes</h2>
        <div className="space-y-4">
          {faq.map(({ q, a }) => (
            <div key={q} className="rounded-2xl border bg-card p-5 shadow-sm">
              <h3 className="mb-1.5 text-sm font-semibold text-foreground">{q}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WhatsApp support CTA */}
      <div className="text-center">
        <p className="mb-3 text-sm text-muted-foreground">
          ¿Tienes dudas? Contáctanos y te ayudamos a elegir la mejor opción.
        </p>
        <a
          href={`${waBase}${encodeURIComponent("Hola, quiero información sobre los planes de anuncios destacados.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 rounded-2xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1aab4f]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 shrink-0" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Hablar con soporte
        </a>
      </div>
    </div>
  );
}
