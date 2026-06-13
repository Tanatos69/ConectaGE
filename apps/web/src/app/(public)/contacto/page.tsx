"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Mail, CheckCircle } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";

const subjects = [
  "Consulta general",
  "Problema con mi anuncio",
  "Reportar contenido",
  "Plan destacado",
  "Problema técnico",
  "Otro",
];

export default function ContactoPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-foreground">Contáctanos</h1>
      <p className="mt-2 text-muted-foreground">
        Escríbenos y te responderemos en menos de 24 horas (días laborables).
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
        {/* Form */}
        <div>
          {sent ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-10 text-center shadow-sm">
              <CheckCircle className="size-12 text-green-600 mb-4" />
              <h2 className="text-lg font-bold text-foreground">¡Mensaje enviado!</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Hemos recibido tu mensaje. Te responderemos en el correo indicado en menos de 24
                horas.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-5 text-sm font-medium text-primary hover:underline"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border bg-card p-6 shadow-sm space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Nombre <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre"
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Correo electrónico <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="tu@email.com"
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Asunto <span className="text-destructive">*</span>
                </label>
                <select
                  required
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  <option value="">Selecciona un asunto</option>
                  {subjects.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Mensaje <span className="text-destructive">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe tu consulta con el mayor detalle posible..."
                  className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Enviar mensaje
              </button>
            </form>
          )}
        </div>

        {/* Contact info sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
            <h2 className="font-semibold text-foreground">Información de contacto</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <MapPin className="size-4 shrink-0 mt-0.5 text-primary" />
                <span>Malabo, Bioko Norte<br />Guinea Ecuatorial</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-primary" />
                <a href="mailto:info@conectage.com" className="hover:text-foreground hover:underline">
                  info@conectage.com
                </a>
              </div>
            </div>
          </div>

          <a
            href="https://wa.me/240222000000?text=Hola%2C+tengo+una+consulta+sobre+ConectaGE."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-[#25D366] p-5 text-white shadow-sm transition-colors hover:bg-[#1aab4f]"
          >
            <WhatsAppIcon className="size-6 shrink-0" />
            <div>
              <p className="font-semibold text-sm">WhatsApp directo</p>
              <p className="text-xs opacity-90">Respuesta en minutos</p>
            </div>
          </a>

          <div className="rounded-2xl border bg-secondary/50 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Horario de atención</p>
            <p>Lunes a viernes: 9:00 – 18:00</p>
            <p>Sábados: 10:00 – 14:00</p>
            <p>Domingos: cerrado</p>
          </div>
        </div>
      </div>
    </div>
  );
}
