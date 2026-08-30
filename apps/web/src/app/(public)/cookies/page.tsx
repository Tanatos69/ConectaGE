import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@gemarket/shared";
import { ConsentPreferencesButton } from "@/components/layout/consent-preferences-button";
import { CONSENT_COOKIE } from "@/lib/consent";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: `Cómo ${BRAND.name} utiliza cookies y tecnologías similares.`,
};

const cookieTypes = [
  {
    name: "Cookies estrictamente necesarias",
    required: true,
    examples:
      `Cookies de sesión y autenticación (Supabase Auth), preferencia de idioma, registro de tu elección de consentimiento (${CONSENT_COOKIE})`,
    purpose:
      "Imprescindibles para el funcionamiento básico de la plataforma: mantener tu sesión iniciada, protegerla frente a accesos no autorizados y recordar tu decisión sobre esta misma política. No pueden desactivarse.",
  },
  {
    name: "Analítica propia (first-party)",
    required: false,
    examples:
      "Registro de eventos de uso en nuestra propia base de datos: búsquedas realizadas, anuncios visitados y clics en botones de WhatsApp",
    purpose:
      "Nos permiten entender qué se busca y qué anuncios interesan para mejorar la plataforma y elaborar estadísticas agregadas. Es analítica propia alojada en nuestra infraestructura: no usamos Google Analytics ni ningún rastreador de terceros, y estos datos no se ceden ni se venden.",
  },
  {
    name: "Personalización",
    required: false,
    examples: "Asociación de tu actividad (búsquedas, anuncios vistos) a tu cuenta de usuario",
    purpose:
      "Si la activas, tu actividad se vincula a tu cuenta para poder ofrecerte contenido más relevante (por ejemplo, anuncios similares a los que consultas). Si solo activas la analítica, tu actividad se registra de forma anónima, sin vincularla a tu cuenta.",
  },
];

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-foreground">Política de cookies</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última actualización: julio de 2026</p>

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        {BRAND.name} utiliza cookies y tecnologías similares para garantizar el funcionamiento de la
        plataforma, y — únicamente con tu consentimiento — para analizar su uso y personalizar tu
        experiencia. Esta página explica qué son las cookies, qué categorías usamos y cómo puedes
        controlarlas en cualquier momento.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground mb-3">¿Qué son las cookies?</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo
          cuando los visitas. Permiten que el sitio recuerde información sobre tu visita para
          hacerla más eficiente y personalizada.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground mb-5">Categorías que usamos</h2>
        <div className="space-y-4">
          {cookieTypes.map(({ name, required, examples, purpose }) => (
            <div key={name} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-sm font-semibold text-foreground">{name}</h3>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    required
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {required ? "Necesaria" : "Opcional"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{purpose}</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Incluye: </span>
                {examples}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground mb-3">Tu consentimiento</h2>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            En tu primera visita mostramos un aviso con tres opciones: <strong className="text-foreground">Aceptar
            todo</strong>, <strong className="text-foreground">Rechazar</strong> (solo las necesarias) o{" "}
            <strong className="text-foreground">Personalizar</strong> cada categoría por separado. Hasta que no
            eliges una opción, no se registra ningún dato de uso.
          </p>
          <p>
            Tu elección se guarda durante 12 meses en la cookie <code className="rounded bg-muted px-1">{CONSENT_COOKIE}</code>{" "}
            y puedes modificarla en cualquier momento desde aquí:
          </p>
          <ConsentPreferencesButton />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground mb-3">Cómo controlar las cookies desde tu navegador</h2>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Además del panel anterior, puedes gestionar o eliminar las cookies desde la
            configuración de tu navegador. Ten en cuenta que desactivar las cookies necesarias puede
            impedir el inicio de sesión.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Chrome: Configuración → Privacidad y seguridad → Cookies</li>
            <li>Firefox: Opciones → Privacidad y seguridad → Cookies</li>
            <li>Safari: Preferencias → Privacidad → Cookies</li>
            <li>Edge: Configuración → Cookies y permisos del sitio</li>
          </ul>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground mb-3">Más información</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Para más información sobre el tratamiento de tus datos personales, consulta nuestra{" "}
          <Link href="/privacidad" className="text-primary hover:underline">
            Política de privacidad
          </Link>
          . Para cualquier consulta, escríbenos a{" "}
          <a href={`mailto:${BRAND.emails.privacy}`} className="text-primary hover:underline">
            {BRAND.emails.privacy}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
