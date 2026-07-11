"use client";

import { useState, useTransition } from "react";
import { Zap, ShieldCheck } from "lucide-react";
import { saveSiteSettingsAction } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

/**
 * Convenience mirror of the "Moderación obligatoria" setting from
 * /admin/ajustes, surfaced directly on the page admins actually work from.
 * Same underlying moderation_required flag — flipping it here or there does
 * the same thing. The existing per-listing bypasses (verified sellers, older
 * accounts) and the automatic flags (keyword blacklist, price threshold)
 * keep working exactly as before regardless of this toggle: "Automático"
 * only skips the baseline queue, never the fraud/abuse checks.
 */
export function ModerationModeToggle({ moderationRequired }: { moderationRequired: boolean }) {
  const [required, setRequired] = useState(moderationRequired);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function setMode(nextRequired: boolean) {
    if (nextRequired === required || pending) return;
    setError("");
    const previous = required;
    setRequired(nextRequired); // optimistic
    startTransition(async () => {
      const result = await saveSiteSettingsAction({ moderation_required: nextRequired });
      if (result?.error) {
        setRequired(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3">
      <div className="flex overflow-hidden rounded-xl border">
        <button
          type="button"
          onClick={() => setMode(true)}
          disabled={pending}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold transition-colors disabled:opacity-60",
            required ? "bg-primary text-white" : "bg-background text-muted-foreground hover:bg-secondary",
          )}
        >
          <ShieldCheck className="size-4" />
          Manual
        </button>
        <button
          type="button"
          onClick={() => setMode(false)}
          disabled={pending}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold transition-colors disabled:opacity-60",
            !required ? "bg-primary text-white" : "bg-background text-muted-foreground hover:bg-secondary",
          )}
        >
          <Zap className="size-4" />
          Automático
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        {required
          ? "Cada anuncio espera tu aprobación antes de publicarse (salvo vendedores verificados o cuentas antiguas, según Ajustes)."
          : "Los anuncios se publican solos al crearse. Los marcados por palabras prohibidas o precio sospechoso siguen esperando tu revisión aquí."}
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
