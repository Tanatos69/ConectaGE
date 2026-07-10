"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Flag, X, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { reportListingAction } from "@/lib/actions/reports";

const REASONS: { value: string; label: string }[] = [
  { value: "fraud", label: "Posible estafa o fraude" },
  { value: "prohibited", label: "Artículo prohibido" },
  { value: "wrong_category", label: "Categoría incorrecta" },
  { value: "duplicate", label: "Anuncio duplicado" },
  { value: "offensive", label: "Contenido ofensivo" },
  { value: "other", label: "Otro motivo" },
];

export function ReportButton({ listingSlug }: { listingSlug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleOpen() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) {
      setError("Selecciona un motivo.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await reportListingAction({ listingSlug, reason, details });
      if (result?.error) setError(result.error);
      else setDone(true);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1.5 rounded-xl border border-input px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Flag className="size-4" />
        Reportar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Reportar anuncio</h2>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>

            {done ? (
              <div className="py-4 text-center">
                <CheckCircle className="mx-auto mb-3 size-10 text-green-600" />
                <p className="text-sm font-medium text-foreground">Reporte enviado</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Gracias por ayudar a mantener ConectaGE seguro. Nuestro equipo lo revisará.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  {REASONS.map((r) => (
                    <label
                      key={r.value}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-input px-3.5 py-2.5 text-sm transition-colors hover:bg-secondary has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        className="accent-primary"
                      />
                      {r.label}
                    </label>
                  ))}
                </div>

                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Detalles adicionales (opcional)…"
                  rows={2}
                  maxLength={500}
                  className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />

                {error && <p className="text-sm text-destructive">{error}</p>}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-white hover:bg-destructive/90 disabled:opacity-60"
                >
                  {pending ? "Enviando…" : "Enviar reporte"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
