import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  description: "Recupera el acceso a tu cuenta de ConectaGE.",
};

export default function RecuperarContrasenaPage() {
  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-2xl border bg-card p-7 shadow-sm">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <Mail className="size-6 text-primary" />
          </div>

          <h1 className="text-xl font-bold text-foreground">Recupera tu contraseña</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Introduce tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          <form className="mt-6 space-y-4" action="/api/auth/forgot-password" method="POST">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="tu@email.com"
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Enviar enlace de recuperación
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Si existe una cuenta con ese correo, recibirás el enlace en breve. Revisa también la
            carpeta de spam.
          </p>
        </div>

        <Link
          href="/login"
          className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
