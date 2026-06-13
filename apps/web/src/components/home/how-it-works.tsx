import Link from "next/link";
import { UserPlus, FileText, ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: UserPlus,
    title: "1. Regístrate gratis",
    description:
      "Crea tu cuenta en segundos con tu teléfono, Google o Facebook. Sin costes ni comisiones.",
    accent: "bg-blue-50 text-blue-600",
  },
  {
    icon: FileText,
    title: "2. Publica tu anuncio",
    description:
      "Añade fotos, precio y descripción. Tu anuncio se revisa y se publica para todo el país.",
    accent: "bg-violet-50 text-violet-600",
  },
  {
    icon: WhatsAppIcon,
    title: "3. Contacta por WhatsApp",
    description:
      "Los compradores te escriben directamente por WhatsApp. Tú cierras el trato, sin intermediarios.",
    accent: "bg-emerald-50 text-emerald-600",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t bg-secondary/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Vender nunca fue tan fácil
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Tres pasos para llegar a miles de compradores en Guinea Ecuatorial.
          </p>
        </div>

        <div className="relative mt-12 grid gap-6 md:grid-cols-3">
          {/* Connecting line (desktop) */}
          <div
            className="absolute left-1/2 top-9 hidden h-0.5 w-2/3 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block"
            aria-hidden="true"
          />
          {steps.map((step) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center rounded-2xl border bg-card p-7 text-center shadow-[var(--shadow-card)]"
            >
              <span className={cn("flex size-16 items-center justify-center rounded-2xl", step.accent)}>
                <step.icon className="size-8" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/publicar" className={cn(buttonVariants({ size: "lg" }))}>
            Empezar a vender
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/ayuda"
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
          >
            ¿Cómo funciona?
          </Link>
        </div>
      </div>
    </section>
  );
}
