import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Política de privacidad y tratamiento de datos personales de ConectaGE.",
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
      <p className="mt-2 text-sm text-muted-foreground">Última actualización: junio de 2025</p>

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        En ConectaGE nos tomamos muy en serio la privacidad de nuestros usuarios. Esta política
        describe qué datos personales recopilamos, cómo los utilizamos y cuáles son tus derechos.
      </p>

      <Section title="1. Responsable del tratamiento">
        <p>
          ConectaGE, con sede en Malabo, Guinea Ecuatorial. Correo de contacto:{" "}
          <a href="mailto:privacidad@conectage.com" className="text-primary hover:underline">
            privacidad@conectage.com
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
            <strong className="text-foreground">Datos de uso:</strong> páginas visitadas,
            búsquedas realizadas, clics en anuncios y botones de WhatsApp, dispositivo y
            sistema operativo, dirección IP y geolocalización aproximada.
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
          <li>Detectar y prevenir fraude y contenido ilícito</li>
          <li>Cumplir obligaciones legales aplicables</li>
        </ul>
      </Section>

      <Section title="4. Base legal del tratamiento">
        <p>
          El tratamiento de tus datos se realiza en base a: (a) la ejecución del contrato de
          servicio (Términos de uso); (b) tu consentimiento explícito para comunicaciones
          opcionales; (c) el interés legítimo de ConectaGE en mejorar y proteger la plataforma.
        </p>
      </Section>

      <Section title="5. Conservación de los datos">
        <p>
          Conservamos tus datos mientras mantengas una cuenta activa en ConectaGE. Tras la
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
          <a href="mailto:privacidad@conectage.com" className="text-primary hover:underline">
            privacidad@conectage.com
          </a>
          .
        </p>
      </Section>

      <Section title="7. Cookies">
        <p>
          Utilizamos cookies para mejorar la experiencia de navegación y analizar el uso de la
          plataforma. Consulta nuestra{" "}
          <a href="/cookies" className="text-primary hover:underline">
            Política de cookies
          </a>{" "}
          para más información.
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
