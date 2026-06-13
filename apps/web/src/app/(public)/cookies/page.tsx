import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Cómo ConectaGE utiliza cookies y tecnologías similares.",
};

const cookieTypes = [
  {
    name: "Cookies estrictamente necesarias",
    required: true,
    examples: "Sesión de usuario, token de autenticación, preferencias de idioma",
    purpose:
      "Imprescindibles para el funcionamiento básico de la plataforma. No pueden desactivarse.",
  },
  {
    name: "Cookies de rendimiento (analítica)",
    required: false,
    examples: "Google Analytics 4",
    purpose:
      "Nos ayudan a entender cómo los usuarios interactúan con la plataforma (páginas más visitadas, tiempo de sesión, fuentes de tráfico) para mejorarla continuamente.",
  },
  {
    name: "Cookies de preferencias",
    required: false,
    examples: "Idioma seleccionado, filtros de búsqueda guardados",
    purpose:
      "Recuerdan tus preferencias para que no tengas que configurarlas cada vez que visitas el sitio.",
  },
];

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-foreground">Política de cookies</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última actualización: junio de 2025</p>

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        ConectaGE utiliza cookies y tecnologías similares para garantizar el funcionamiento de la
        plataforma, analizar su uso y recordar tus preferencias. Esta página explica qué son las
        cookies, qué tipos usamos y cómo puedes controlarlas.
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
        <h2 className="text-lg font-bold text-foreground mb-5">Tipos de cookies que usamos</h2>
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
                <span className="font-medium text-foreground">Ejemplos: </span>
                {examples}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground mb-3">Cómo controlar las cookies</h2>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Puedes gestionar las cookies desde la configuración de tu navegador. Ten en cuenta que
            desactivar ciertas cookies puede afectar al funcionamiento de la plataforma.
          </p>
          <p>Instrucciones según navegador:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Chrome: Configuración → Privacidad y seguridad → Cookies</li>
            <li>Firefox: Opciones → Privacidad y seguridad → Cookies</li>
            <li>Safari: Preferencias → Privacidad → Cookies</li>
            <li>Edge: Configuración → Cookies y permisos del sitio</li>
          </ul>
          <p>
            Para optar por no participar en Google Analytics, puedes instalar el{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              complemento de exclusión de Google Analytics
            </a>
            .
          </p>
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
          <a href="mailto:privacidad@conectage.com" className="text-primary hover:underline">
            privacidad@conectage.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
