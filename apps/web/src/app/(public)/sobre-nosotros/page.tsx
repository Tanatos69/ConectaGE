import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description:
    "Conoce ConectaGE: el marketplace de anuncios clasificados para Guinea Ecuatorial y la diáspora africana.",
};

export default function SobreNosotrosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-foreground">Sobre ConectaGE</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        El mercado de anuncios clasificados de Guinea Ecuatorial.
      </p>

      {/* Mission */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground mb-3">Nuestra misión</h2>
        <div className="prose-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            ConectaGE nació con un objetivo claro: ofrecer a los ciudadanos de Guinea Ecuatorial y
            la diáspora africana una plataforma moderna, gratuita y confiable para comprar y vender
            cualquier tipo de artículo o servicio.
          </p>
          <p>
            Creemos que el comercio local debe ser accesible para todos. Por eso publicar un anuncio
            en ConectaGE es completamente gratis, sin comisiones ni pagos ocultos. El contacto entre
            comprador y vendedor se hace directamente por WhatsApp, sin intermediarios.
          </p>
          <p>
            Operamos principalmente en <strong className="text-foreground">Malabo</strong> y{" "}
            <strong className="text-foreground">Bata</strong>, pero nuestra plataforma está
            disponible para toda Guinea Ecuatorial y para la comunidad ecuatoguineana en el exterior.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground mb-5">Nuestros valores</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Confianza",
              desc: "Moderamos cada anuncio antes de publicarlo para garantizar un entorno seguro.",
            },
            {
              title: "Accesibilidad",
              desc: "Diseñado para funcionar bien en cualquier dispositivo y conexión de internet.",
            },
            {
              title: "Comunidad",
              desc: "Conectamos vendedores locales con compradores de Guinea Ecuatorial y la diáspora.",
            },
          ].map(({ title, desc }) => (
            <div key={title} className="rounded-2xl border bg-card p-5 shadow-sm">
              <h3 className="font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact info */}
      <section className="mt-10 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-4">Contacto</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <MapPin className="size-4 shrink-0 text-primary" />
            <span>Malabo, Bioko Norte, Guinea Ecuatorial</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail className="size-4 shrink-0 text-primary" />
            <a href="mailto:info@conectage.com" className="hover:text-foreground hover:underline">
              info@conectage.com
            </a>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Phone className="size-4 shrink-0 text-primary" />
            <a href="tel:+240222000000" className="hover:text-foreground hover:underline">
              +240 222 000 000
            </a>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <WhatsAppIcon className="size-4 shrink-0 text-[#25D366]" />
            <a
              href="https://wa.me/240222000000"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline"
            >
              WhatsApp: +240 222 000 000
            </a>
          </div>
        </div>
      </section>

      <div className="mt-8 text-center">
        <Link
          href="/contacto"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Envíanos un mensaje
        </Link>
      </div>
    </div>
  );
}
