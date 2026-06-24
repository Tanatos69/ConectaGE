"use client";

import Link from "next/link";
import { Check, Star } from "lucide-react";
import { CreditPacks } from "@/components/promote/credit-packs";
import { promotionOptions, sellerPlans } from "@/lib/promotions";
import { cn } from "@/lib/utils";

const waBase = "https://wa.me/240222000000?text=";

const faq = [
  {
    q: "¿Cómo funcionan los créditos?",
    a: "Compras un paquete de créditos y los usas para destacar tus anuncios con las opciones de visibilidad. Cada opción tiene un coste en créditos y una duración.",
  },
  {
    q: "¿Qué métodos de pago aceptáis?",
    a: "Muni Dinero, Rosa Money, BGF Mobile y transferencia bancaria (CCEI, BGFI, BANGE). El pago con tarjeta llegará próximamente.",
  },
  {
    q: "¿Cuándo empieza a contar el período de destacado?",
    a: "El período comienza en el momento en que aplicas la promoción a tu anuncio desde 'Mis anuncios'.",
  },
  {
    q: "¿Puedo destacar cualquier anuncio?",
    a: "Sí, siempre que el anuncio esté publicado y cumpla nuestros términos. Los anuncios en revisión no pueden destacarse hasta ser aprobados.",
  },
];

export function PlanesView() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">Destaca tu anuncio</h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
          Llega a más compradores y vende más rápido con las opciones de visibilidad de ConectaGE.
        </p>
      </div>

      {/* Visibility options */}
      <section className="mb-14">
        <h2 className="mb-1 text-xl font-bold text-foreground">Opciones de visibilidad</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Aplica estas promociones a tus anuncios usando créditos.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {promotionOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.id}
                className={cn(
                  "flex gap-4 rounded-2xl border bg-card p-5 shadow-sm",
                  opt.highlight && "border-amber-300/70 bg-amber-50/40",
                )}
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-foreground">{opt.name}</h3>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {opt.credits} créditos
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{opt.description}</p>
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    Duración: {opt.durationLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Credit packs */}
      <section className="mb-14">
        <h2 className="mb-1 text-xl font-bold text-foreground">Compra créditos</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Elige un paquete. Cuanto mayor el paquete, más créditos de regalo.
        </p>
        <CreditPacks showBalance />
      </section>

      {/* Seller plans */}
      <section className="mb-14">
        <h2 className="mb-1 text-xl font-bold text-foreground">Planes para vendedores</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Para profesionales y empresas que venden de forma habitual.
        </p>
        <div className="grid gap-5 sm:grid-cols-3">
          {sellerPlans.map((plan) => (
            <div
              key={plan.id}
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
              <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              <p className="mb-4 mt-1 text-2xl font-extrabold text-foreground">{plan.priceLabel}</p>
              <ul className="mb-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-green-600" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              {plan.id === "particular" ? (
                <Link
                  href="/publicar"
                  className="rounded-xl border border-primary py-2.5 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  Empezar gratis
                </Link>
              ) : (
                <a
                  href={`${waBase}${encodeURIComponent(`Hola, me interesa el plan ${plan.name} para vendedores en ConectaGE.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "rounded-xl py-2.5 text-center text-sm font-semibold transition-colors",
                    plan.popular
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "border border-primary text-primary hover:bg-primary hover:text-white",
                  )}
                >
                  Contratar
                </a>
              )}
            </div>
          ))}
        </div>
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
          href={`${waBase}${encodeURIComponent("Hola, quiero información sobre las opciones de visibilidad y créditos.")}`}
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
