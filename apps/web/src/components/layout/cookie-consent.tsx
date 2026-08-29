"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Cookie, Settings2 } from "lucide-react";
import {
  readConsent,
  writeConsent,
  CONSENT_ALL,
  CONSENT_NONE,
  type Consent,
} from "@/lib/consent";
import { cn } from "@/lib/utils";

function Toggle({
  checked,
  disabled,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label
      className={cn(
        "flex items-start justify-between gap-3 rounded-xl border p-3",
        disabled ? "bg-muted/40" : "cursor-pointer hover:bg-secondary/50",
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            "h-6 w-11 rounded-full transition-colors",
            checked ? "bg-primary" : "bg-muted-foreground/30",
            disabled && "opacity-60",
          )}
        />
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[1.4rem]" : "translate-x-0.5",
          )}
        />
      </span>
    </label>
  );
}

export function CookieConsent() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: true, personalization: true });

  useEffect(() => {
    // Show only when no decision has been recorded yet. Also re-show when
    // /cookies clears the cookie ("Cambiar mis preferencias").
    function check() {
      setVisible(readConsent() === null);
    }
    check();
    window.addEventListener("gemarket-consent-cleared", check);
    return () => window.removeEventListener("gemarket-consent-cleared", check);
  }, []);

  if (!visible) return null;

  function decide(consent: Consent) {
    writeConsent(consent);
    setVisible(false);
    setCustomizing(false);
    // Server Components re-read the cookie and start/stop logging.
    router.refresh();
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-4 sm:pt-4 sm:pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-4 shadow-2xl sm:p-5">
        <div className="flex items-start gap-3">
          <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:flex">
            <Cookie className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              Cookies y datos de uso
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Usamos cookies necesarias para que GEMarket funcione y, solo si lo aceptas,
              datos de uso anónimos (búsquedas y visitas) para mejorar la plataforma y
              personalizar tu experiencia. No vendemos tus datos a terceros.{" "}
              <Link href="/cookies" className="font-medium text-primary hover:underline">
                Política de cookies
              </Link>
            </p>
          </div>
        </div>

        {customizing && (
          <div className="mt-4 space-y-2">
            <Toggle
              checked
              disabled
              label="Necesarias"
              description="Sesión, seguridad y preferencias básicas. Siempre activas."
            />
            <Toggle
              checked={prefs.analytics}
              onChange={(v) =>
                setPrefs((p) => ({
                  analytics: v,
                  // Personalization requires analytics.
                  personalization: v ? p.personalization : false,
                }))
              }
              label="Analítica"
              description="Datos de uso anónimos (búsquedas, visitas de anuncios) para estadísticas internas."
            />
            <Toggle
              checked={prefs.personalization}
              onChange={(v) =>
                setPrefs((p) => ({
                  analytics: v ? true : p.analytics,
                  personalization: v,
                }))
              }
              label="Personalización"
              description="Asocia tu actividad a tu cuenta para mostrarte contenido más relevante."
            />
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {customizing ? (
            <>
              <button
                onClick={() => setCustomizing(false)}
                className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                Volver
              </button>
              <button
                onClick={() => decide({ v: 1, ...prefs })}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Guardar preferencias
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCustomizing(true)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                <Settings2 className="size-4" />
                Personalizar
              </button>
              <button
                onClick={() => decide(CONSENT_NONE)}
                className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Rechazar
              </button>
              <button
                onClick={() => decide(CONSENT_ALL)}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Aceptar todo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
