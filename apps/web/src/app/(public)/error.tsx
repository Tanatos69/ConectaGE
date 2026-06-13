"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 mb-5">
        <AlertTriangle className="size-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Error del servidor</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado y estamos trabajando
        para solucionarlo.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
        >
          Volver al inicio
        </Link>
      </div>

      {error.digest && (
        <p className="mt-6 text-xs text-muted-foreground">
          Código de error: <code className="font-mono">{error.digest}</code>
        </p>
      )}
    </div>
  );
}
