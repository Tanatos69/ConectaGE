import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Nueva contraseña",
  description: "Establece una nueva contraseña para tu cuenta de ConectaGE.",
};

export default function ResetearContrasenaPage() {
  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-2xl border bg-card p-7 shadow-sm">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <Lock className="size-6 text-primary" />
          </div>

          <h1 className="text-xl font-bold text-foreground">Nueva contraseña</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Elige una contraseña segura para proteger tu cuenta.
          </p>

          <form className="mt-6 space-y-4" action="/api/auth/reset-password" method="POST">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                Nueva contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Mínimo 8 caracteres"
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-foreground">
                Confirmar contraseña
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Repite la contraseña"
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Guardar nueva contraseña
            </button>
          </form>
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
