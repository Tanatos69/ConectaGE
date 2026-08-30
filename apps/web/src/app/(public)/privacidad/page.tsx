import type { Metadata } from "next";
import { BRAND } from "@gemarket/shared";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: `Política de privacidad y tratamiento de datos personales de ${BRAND.name}.`,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-foreground mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-foreground">Política de privacidad</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última actualización: julio de 2026</p>

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        En {BRAND.name} nos tomamos muy en serio la privacidad de nuestros usuarios. Esta política
        describe qué datos personales recopilamos, cómo los utilizamos y cuáles son tus derechos.
      </p>

      <Section title="1. Responsable del tratamiento">
        <p>
          {BRAND.legalName}, con sede en {BRAND.legalCity}, Guinea Ecuatorial. Correo de contacto:{" "}
          <a href={`mailto:${BRAND.emails.privacy}`} className="text-primary hover:underline">
            {BRAND.emails.privacy}
          </a>
        </p>
      </Section>

      <Section title="2. Datos que recopilamos">
        <p>Recopilamos los siguientes datos cuando utilizas nuestros servicios:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong className="text-foreground">Datos de registro:</strong> nombre, número de
            teléfono, número de WhatsApp, correo electrónico, ciudad, país.
          </li>
          <li>
            <strong className="text-foreground">Datos de anuncios:</strong> títulos, descripciones,
            fotografías, precio, ubicación y categoría de los artículos publicados.
          </li>
          <li>
            <strong className="text-foreground">Datos de uso (con tu consentimiento):</strong>{" "}
            búsquedas realizadas, anuncios visitados, clics en los botones de contacto de
            WhatsApp y tipo de dispositivo (móvil o escritorio). Se registran en nuestra propia
            infraestructura (analítica de primera parte, sin rastreadores de terceros) y solo si
            aceptas la categoría de analítica en el aviso de cookies. Si además activas la
            categoría de personalización, esta actividad se asocia a tu cuenta; en caso
            contrario se registra de forma anónima.
          </li>
          <li>
            <strong className="text-foreground">Datos demográficos (opcionales):</strong> género
            y rango de edad, únicamente si decides declararlos en la configuración de tu perfil.
            Puedes eliminarlos en cualquier momento.
          </li>
          <li>
            <strong className="text-foreground">Datos de comunicaciones:</strong> mensajes enviados
            a través de nuestro formulario de contacto.
          </li>
        </ul>
      </Section>

      <Section title="3. Cómo utilizamos tus datos">
        <ul className="list-disc pl-5 space-y-1">
          <li>Gestionar tu cuenta y los anuncios que publicas</li>
          <li>Moderar el contenido de la plataforma</li>
          <li>Enviarte notificaciones sobre tus anuncios (aprobación, expiración, reseñas)</li>
          <li>Mejorar el rendimiento y la experiencia de uso de la plataforma</li>
          <li>
            Elaborar estadísticas agregadas de uso y, si has activado la categoría de
            personalización, mostrarte contenido más relevante para ti
          </li>
          <li>Detectar y prevenir fraude y contenido ilícito</li>
          <li>Cumplir obligaciones legales aplicables</li>
        </ul>
        <p>
          <strong className="text-foreground">
            No cedemos, compartimos ni vendemos tus datos personales ni tus datos de uso a
            terceros.
          </strong>{" "}
          La analítica de {BRAND.name} es de primera parte: los datos permanecen en nuestra propia
          infraestructura y se emplean exclusivamente para los fines descritos en esta política.
        </p>
      </Section>

      <Section title="4. Base legal del tratamiento">
        <p>
          El tratamiento de tus datos se realiza en base a: (a) la ejecución del contrato de
          servicio (Términos de uso); (b) tu consentimiento explícito para comunicaciones
          opcionales; (c) el interés legítimo de {BRAND.name} en mejorar y proteger la plataforma.
        </p>
      </Section>

      <Section title="5. Conservación de los datos">
        <p>
          Conservamos tus datos mientras mantengas una cuenta activa en {BRAND.name}. Tras la
          eliminación de tu cuenta, los datos se anonomizan o eliminan en un plazo máximo de 30
          días, salvo obligación legal de conservación.
        </p>
      </Section>

      <Section title="6. Tus derechos">
        <p>Tienes derecho a:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong className="text-foreground">Acceso:</strong> solicitar una copia de los datos
            que tenemos sobre ti.
          </li>
          <li>
            <strong className="text-foreground">Rectificación:</strong> corregir datos inexactos.
          </li>
          <li>
            <strong className="text-foreground">Supresión:</strong> solicitar la eliminación de tus
            datos (&ldquo;derecho al olvido&rdquo;).
          </li>
          <li>
            <strong className="text-foreground">Portabilidad:</strong> recibir tus datos en formato
            estructurado.
          </li>
          <li>
            <strong className="text-foreground">Oposición:</strong> oponerte al tratamiento de tus
            datos para fines específicos.
          </li>
        </ul>
        <p>
          Para ejercer estos derechos, escríbenos a{" "}
          <a href={`mailto:${BRAND.emails.privacy}`} className="text-primary hover:underline">
            {BRAND.emails.privacy}
          </a>
          .
        </p>
      </Section>

      <Section title="7. Cookies y consentimiento">
        <p>
          Utilizamos cookies necesarias para el funcionamiento de la plataforma y, solo con tu
          consentimiento expreso, registramos datos de uso con fines de analítica y
          personalización. En tu primera visita te mostramos un aviso donde puedes aceptar,
          rechazar o personalizar cada categoría; tu elección puede modificarse en cualquier
          momento desde la{" "}
          <a href="/cookies" className="text-primary hover:underline">
            Política de cookies
          </a>
          .
        </p>
      </Section>

      <Section title="8. Cambios en esta política">
        <p>
          Podemos actualizar esta política periódicamente. Notificaremos cambios sustanciales a los
          usuarios registrados por correo electrónico o mediante aviso en la plataforma.
        </p>
      </Section>
    </div>
  );
}
