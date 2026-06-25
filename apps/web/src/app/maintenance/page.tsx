import Link from "next/link";
import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary/10">
        <Wrench className="size-10 text-primary" />
      </div>

      <h1 className="text-3xl font-bold text-foreground">Volvemos pronto</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Estamos realizando mejoras en la plataforma. El sitio estará disponible de nuevo en unos minutos. Gracias por tu paciencia.
      </p>

      <div className="mt-8 flex items-center gap-2 rounded-2xl border border-input bg-card px-6 py-4 text-sm text-muted-foreground shadow-sm">
        <span className="font-semibold text-foreground">ConectaGE</span>
        <span>·</span>
        <span>Guinea Ecuatorial</span>
      </div>

      <Link
        href="/login?next=/admin"
        className="mt-6 text-xs text-muted-foreground/60 underline-offset-4 hover:text-muted-foreground hover:underline"
      >
        Acceso administrador
      </Link>
    </div>
  );
}
