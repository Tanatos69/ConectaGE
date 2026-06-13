import type { Metadata } from "next";
import { Check, Zap, Star, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Planes de anuncio destacado",
  description:
    "Destaca tu anuncio en ConectaGE y llega a más compradores en Guinea Ecuatorial. Planes desde 5.000 FCFA.",
};

interface Plan {
  id: string;
  name: string;
  price: string;
  duration: string;
  icon: LucideIcon;
  colorClass: string;
  chipClass: string;
  ctaClass: string;
  popular: boolean;
  features: string[];
}

const plans: Plan[] = [
  {
    id: "7d",
    name: "7 días",
    price: "5.000 FCFA",
    duration: "7 días de destacado",
    icon: Zap,
    colorClass: "",
    chipClass: "bg-blue-50 text-blue-600",
    ctaClass:
      "border border-primary bg-primary/5 text-primary hover:bg-primary hover:text-white",
    popular: false,
    features: [
      "Sección Destacados en la home",
      "Tarjeta con borde y etiqueta dorada",
      "Mayor posición en resultados de categoría",
      "Hasta 3× más visitas estimadas",
    ],
  },
  {
    id: "15d",
    name: "15 días",
    price: "8.000 FCFA",
    duration: "15 días de destacado",
    icon: Star,
    colorClass: "border-2 border-amber-400 shadow-amber-100",
    chipClass: "bg-amber-50 text-amber-600",
    ctaClass: "bg-amber-400 text-amber-900 hover:bg-amber-500",
    popular: true,
    features: [
      "Todo lo del plan 7 días",
      "Aparición en el banner de la home",
      "Notificación a suscriptores de la categoría",
      "Hasta 5× más visitas estimadas",
    ],
  },
  {
    id: "30d",
    name: "30 días",
    price: "12.000 FCFA",
    duration: "30 días de destacado",
    icon: Shield,
    colorClass: "",
    chipClass: "bg-violet-50 text-violet-600",
    ctaClass:
      "border border-primary bg-primary/5 text-primary hover:bg-primary hover:text-white",
    popular: false,
    features: [
      "Todo lo del plan 15 días",
      "Badge exclusivo en tu perfil de vendedor",
      "Máxima prioridad en búsquedas",
      "Hasta 8× más visitas estimadas",
      "Reactivación gratuita si el anuncio expira",
    ],
  },
];

const faq = [
  {
    q: "¿Cómo se activa mi anuncio destacado?",
    a: "Tras realizar el pago, envíanos el comprobante por WhatsApp. Activamos tu anuncio manualmente en menos de 2 horas en horario laboral (9:00–18:00, lunes a viernes).",
  },
  {
    q: "¿Qué métodos de pago aceptáis?",
    a: "Transferencia bancaria (CCEI, BGFI, BANGE), mobile money (Movistar Money, Orange Money) y efectivo en nuestras oficinas de Malabo y Bata.",
  },
  {
    q: "¿Cuándo empieza a contar el período de destacado?",
    a: "El período comienza en el momento en que activamos el anuncio, no desde el pago.",
  },
  {
    q: "¿Puedo destacar cualquier anuncio?",
    a: "Sí, siempre que el anuncio esté publicado y cumpla nuestros términos de uso. Los anuncios en revisión no pueden destacarse hasta ser aprobados.",
  },
  {
    q: "¿Hay reembolsos?",
    a: "No realizamos reembolsos una vez activado el plan. Si hubiese un problema técnico de nuestra parte, compensamos con días adicionales.",
  },
];

export default function PlanesPage() {
  const waBase = "https://wa.me/240222000000?text=";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
          Destaca tu anuncio
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
          Llega a más compradores y vende más rápido con un anuncio destacado en ConectaGE.
        </p>
      </div>

      {/* Plan cards */}
      <div className="mb-16 grid gap-5 sm:grid-cols-3">
        {plans.map(({ id, name, price, duration, icon: Icon, colorClass, chipClass, ctaClass, popular, features }) => (
          <div
            key={id}
            className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${colorClass}`}
          >
            {popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-amber-400 px-3.5 py-1 text-xs font-bold text-amber-900 shadow-sm">
                  MÁS POPULAR
                </span>
              </div>
            )}

            <div className={`mb-4 flex size-12 items-center justify-center rounded-2xl ${chipClass}`}>
              <Icon className="size-6" />
            </div>

            <h2 className="text-xl font-bold text-foreground">{name}</h2>
            <p className="mb-0.5 mt-1 text-3xl font-extrabold text-foreground">{price}</p>
            <p className="mb-5 text-sm text-muted-foreground">{duration}</p>

            <ul className="mb-6 flex-1 space-y-2.5">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-green-600" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>

            <a
              href={`${waBase}${encodeURIComponent(`Hola, quiero destacar mi anuncio con el plan ${name} (${price}). Mi anuncio: [pega el enlace aquí]`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition-colors ${ctaClass}`}
            >
              Contratar plan
            </a>
          </div>
        ))}
      </div>

      {/* What "featured" means */}
      <section className="mb-12 rounded-2xl border bg-secondary/50 p-6">
        <h2 className="mb-3 text-lg font-bold text-foreground">
          ¿Qué significa &ldquo;Destacado&rdquo;?
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Los anuncios destacados aparecen con un borde dorado y la etiqueta{" "}
          <strong className="inline-flex items-center gap-1 text-foreground"><Star className="size-3.5 fill-amber-400 text-amber-400" />Destacado</strong> en las páginas de categoría y
          búsqueda, y en la sección especial de la página de inicio. Esto les da una visibilidad
          significativamente mayor que a los anuncios normales, especialmente en las búsquedas más
          competidas. Un anuncio normal puede esperar días para recibir contactos; uno destacado
          suele recibirlos en horas.
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

      {/* WhatsApp CTA */}
      <div className="text-center">
        <p className="mb-3 text-sm text-muted-foreground">
          ¿Tienes dudas? Contáctanos y te ayudamos a elegir el plan más adecuado.
        </p>
        <a
          href={`${waBase}${encodeURIComponent("Hola, quiero información sobre los planes de anuncio destacado.")}`}
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
