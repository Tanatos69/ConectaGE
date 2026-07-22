"use client";

import { useEffect, useState } from "react";
import { Share, X } from "lucide-react";
import { isIOSSafari, isStandalone } from "@/lib/pwa/standalone";
import { readConsent } from "@/lib/consent";

const DISMISSED_KEY = "conectage-ios-install-dismissed";

/**
 * iOS has no `beforeinstallprompt` event — Safari never fires one — so
 * there's no programmatic install trigger there, only this manual nudge
 * toward the Share ⟶ Add to Home Screen flow. Chrome/Android gets its own
 * native install prompt for free and doesn't need this.
 */
export function IosInstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Both this banner and CookieConsent are fixed bottom sheets — wait for
    // the cookie decision first so they never stack on top of each other.
    const dismissed = window.localStorage.getItem(DISMISSED_KEY) === "1";
    setVisible(isIOSSafari() && !isStandalone() && !dismissed && readConsent() !== null);
  }, []);

  if (!visible) return null;

  function dismiss() {
    window.localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border bg-card p-4 shadow-2xl">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Share className="size-5 text-primary" />
        </div>
        <p className="min-w-0 flex-1 text-sm text-foreground">
          Instala <span className="font-semibold">ConectaGE</span>: toca{" "}
          <Share className="inline size-3.5 align-text-bottom" /> Compartir y luego{" "}
          <span className="font-medium">&quot;Añadir a pantalla de inicio&quot;</span>.
        </p>
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
