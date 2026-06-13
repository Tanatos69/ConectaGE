import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ayuda y preguntas frecuentes",
  description: "Encuentra respuestas a las preguntas más frecuentes sobre ConectaGE.",
};

const sections = [
  {
    title: "Publicar anuncios",
    items: [
      {
        q: "¿Es gratis publicar un anuncio?",
        a: "Sí, publicar anuncios en ConectaGE es completamente gratuito. Sin límite de anuncios activos para usuarios registrados. Los anuncios destacados (mayor visibilidad) tienen un coste opcional; consulta nuestros planes.",
      },
      {
        q: "¿Cuánto tiempo tarda en publicarse mi anuncio?",
        a: "Revisamos cada anuncio manualmente antes de publicarlo. Normalmente lo aprobamos en menos de 2 horas en horario laboral (9:00–18:00, lunes a viernes). Si tu anuncio fue rechazado, recibirás una notificación con el motivo.",
      },
      {
        q: "¿Cuánto tiempo permanece activo mi anuncio?",
        a: "Los anuncios permanecen activos durante 60 días desde la fecha de publicación. Recibirás un aviso por notificación cuando falten 5 días para que expire. Puedes renovarlo gratis desde tu panel de control.",
      },
      {
        q: "¿Puedo editar mi anuncio después de publicarlo?",
        a: "Sí. Ve a Mi cuenta > Mis anuncios, y haz clic en Editar. Ten en cuenta que al guardar los cambios, el anuncio pasará de nuevo a revisión antes de volver a publicarse.",
      },
      {
        q: "¿Qué tipo de artículos no puedo publicar?",
        a: "Está prohibido publicar armas, explosivos, artículos robados, medicamentos sin receta, contenido adulto, animales en peligro de extinción, y cualquier contenido ilegal en Guinea Ecuatorial. Consulta los Términos de uso para la lista completa.",
      },
    ],
  },
  {
    title: "Contactar con vendedores",
    items: [
      {
        q: "¿Cómo contacto al vendedor de un anuncio?",
        a: 'Haciendo clic en el botón verde "Contactar por WhatsApp" en la página del anuncio. Se abrirá WhatsApp (web o app) con un mensaje pre-rellenado al número del vendedor. No hay mensajería interna en ConectaGE; todo el contacto es por WhatsApp.',
      },
      {
        q: "El vendedor no responde, ¿qué hago?",
        a: "Puedes intentar contactar en otro horario. Si el anuncio lleva mucho tiempo sin respuesta, considera reportarlo para que nuestro equipo lo revise. No envíes dinero a vendedores que no responden.",
      },
    ],
  },
  {
    title: "Anuncios destacados y planes",
    items: [
      {
        q: "¿Qué es un anuncio destacado?",
        a: 'Un anuncio destacado aparece con un borde dorado y la etiqueta "Destacado" en las páginas de categoría y búsqueda, y en la sección especial de la home. Esto le da significativamente más visibilidad.',
      },
      {
        q: "¿Cómo pago un plan de destacado?",
        a: "Aceptamos transferencia bancaria (CCEI, BGFI, BANGE), mobile money (Movistar Money, Orange Money) y efectivo en nuestras oficinas. Envíanos el comprobante por WhatsApp y activamos el plan en menos de 2 horas.",
      },
    ],
  },
  {
    title: "Mi cuenta",
    items: [
      {
        q: "¿Cómo cambio mi contraseña?",
        a: "Ve a Mi cuenta > Mi perfil > sección Seguridad. Introduce tu contraseña actual y la nueva contraseña dos veces. También puedes usar la opción '¿Olvidaste tu contraseña?' en la pantalla de inicio de sesión.",
      },
      {
        q: "¿Cómo elimino mi cuenta?",
        a: "Ve a Mi cuenta > Mi perfil > Zona de peligro. Puedes desactivar tu cuenta temporalmente (oculta tus anuncios 30 días) o eliminarla permanentemente. La eliminación es irreversible y borra todos tus datos.",
      },
      {
        q: "¿Qué es el vendedor verificado?",
        a: "El badge \"Vendedor Verificado\" indica que el usuario ha confirmado su identidad con documento de identidad y número de teléfono. Genera más confianza en los compradores.",
      },
    ],
  },
];

export default function AyudaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-foreground">Centro de ayuda</h1>
      <p className="mt-2 text-muted-foreground">
        Encuentra respuestas rápidas a las preguntas más frecuentes.
      </p>

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-bold text-foreground mb-4">{section.title}</h2>
            <div className="space-y-2">
              {section.items.map(({ q, a }) => (
                <details
                  key={q}
                  className="group rounded-2xl border bg-card shadow-sm open:shadow-md"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-foreground list-none">
                    <span>{q}</span>
                    <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </summary>
                  <p className="px-5 pb-4 pt-0 text-sm leading-relaxed text-muted-foreground">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border bg-secondary/50 p-6 text-center">
        <p className="text-sm font-medium text-foreground mb-1">
          ¿No encontraste lo que buscabas?
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Nuestro equipo está disponible para ayudarte.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/contacto"
            className="rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
          >
            Enviar un mensaje
          </Link>
          <a
            href="https://wa.me/240222000000"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1aab4f]"
          >
            WhatsApp directo
          </a>
        </div>
      </div>
    </div>
  );
}
