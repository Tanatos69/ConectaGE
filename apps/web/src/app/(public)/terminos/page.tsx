import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y condiciones de uso",
  description: "Términos y condiciones de uso de la plataforma ConectaGE.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-foreground mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-foreground">Términos y condiciones de uso</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última actualización: junio de 2025</p>

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        Al acceder o utilizar la plataforma ConectaGE (&ldquo;el Servicio&rdquo;), aceptas
        quedar vinculado por los presentes Términos y Condiciones. Si no estás de acuerdo con
        alguno de estos términos, no debes utilizar el Servicio.
      </p>

      <Section title="1. Descripción del servicio">
        <p>
          ConectaGE es una plataforma de anuncios clasificados que permite a usuarios particulares
          y empresas publicar, buscar y contactar anuncios de compraventa de productos y servicios
          en Guinea Ecuatorial. El Servicio actúa como intermediario tecnológico y no participa en
          ninguna transacción entre compradores y vendedores.
        </p>
      </Section>

      <Section title="2. Registro y cuenta de usuario">
        <p>
          Para publicar anuncios debes crear una cuenta. Eres responsable de mantener la
          confidencialidad de tus credenciales y de todas las actividades que se realicen bajo tu
          cuenta. Debes notificarnos inmediatamente de cualquier uso no autorizado.
        </p>
        <p>
          Debes proporcionar información veraz y actualizada. ConectaGE se reserva el derecho de
          suspender o eliminar cuentas que proporcionen información falsa o incumplan estos
          términos.
        </p>
      </Section>

      <Section title="3. Publicación de anuncios">
        <p>
          Los anuncios deben describir con precisión el artículo o servicio ofrecido. Las fotos
          deben corresponder al artículo real. Está prohibido publicar el mismo anuncio más de una
          vez de forma simultánea.
        </p>
        <p>
          Todos los anuncios son revisados por nuestro equipo antes de ser publicados. Nos
          reservamos el derecho de rechazar, modificar o eliminar cualquier anuncio sin previo
          aviso.
        </p>
      </Section>

      <Section title="4. Contenido prohibido">
        <p>Está estrictamente prohibido publicar anuncios de:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Armas de fuego, municiones o explosivos</li>
          <li>Estupefacientes y sustancias controladas</li>
          <li>Artículos robados o de procedencia ilícita</li>
          <li>Medicamentos sin receta o productos sanitarios no homologados</li>
          <li>Contenido pornográfico o de explotación sexual</li>
          <li>Animales en peligro de extinción o protegidos</li>
          <li>Servicios de prostitución o proxenetismo</li>
          <li>Cualquier bien o servicio cuya venta sea ilegal en Guinea Ecuatorial</li>
          <li>Anuncios engañosos o fraudulentos</li>
        </ul>
        <p>
          La infracción de estas normas conllevará la eliminación inmediata del anuncio y la
          suspensión o eliminación permanente de la cuenta, sin perjuicio de las acciones legales
          que pudieran corresponder.
        </p>
      </Section>

      <Section title="5. Responsabilidad del usuario">
        <p>
          ConectaGE no es parte en las transacciones entre usuarios y no garantiza la calidad,
          exactitud ni legalidad de los anuncios publicados. Cada usuario es el único responsable
          de las operaciones que realice a través de la plataforma.
        </p>
        <p>
          Te recomendamos verificar siempre el artículo antes de efectuar cualquier pago y quedar
          en lugares públicos para las transacciones en persona.
        </p>
      </Section>

      <Section title="6. Propiedad intelectual">
        <p>
          Al publicar contenido (textos, imágenes, etc.) en ConectaGE, nos concedes una licencia
          no exclusiva, mundial y libre de regalías para mostrar, reproducir y distribuir dicho
          contenido dentro del Servicio.
        </p>
        <p>
          Declaras y garantizas que posees o tienes los derechos necesarios sobre el contenido que
          publicas y que dicho contenido no infringe derechos de terceros.
        </p>
      </Section>

      <Section title="7. Limitación de responsabilidad">
        <p>
          ConectaGE no será responsable por daños directos, indirectos, incidentales o
          consecuentes derivados del uso o la imposibilidad de uso del Servicio, incluyendo
          pérdidas económicas derivadas de transacciones entre usuarios.
        </p>
      </Section>

      <Section title="8. Modificaciones">
        <p>
          Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios
          serán notificados a los usuarios registrados por correo electrónico y/o mediante aviso
          en la plataforma. El uso continuado del Servicio tras la notificación implicará la
          aceptación de los nuevos términos.
        </p>
      </Section>

      <Section title="9. Ley aplicable">
        <p>
          Estos Términos se rigen por las leyes de la República de Guinea Ecuatorial. Cualquier
          disputa se someterá a la jurisdicción de los tribunales de Malabo.
        </p>
      </Section>

      <Section title="10. Contacto">
        <p>
          Para cualquier consulta sobre estos Términos, puedes contactarnos en{" "}
          <a href="mailto:legal@conectage.com" className="text-primary hover:underline">
            legal@conectage.com
          </a>
          .
        </p>
      </Section>
    </div>
  );
}
