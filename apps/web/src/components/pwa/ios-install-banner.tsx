"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpSquare, SquarePlus, X } from "lucide-react";
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
    <div className="fixed inset-x-0 bottom-0 z-50 animate-fade-in-up px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-4 sm:pt-4 sm:pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl border bg-card shadow-2xl">
        <div className="flex items-center gap-3 p-4 pb-3.5">
          <Image
            src="/icon-192.png"
            alt=""
            width={48}
            height={48}
            className="size-12 shrink-0 rounded-[22%] shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">ConectaGE</p>
            <p className="truncate text-xs text-muted-foreground">
              Añade la app a tu pantalla de inicio
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Cerrar"
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 border-t bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
          <span>1. Toca</span>
          <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-background text-primary shadow-sm">
            <ArrowUpSquare className="size-3" />
          </span>
          <span>Compartir</span>
          <span className="mx-0.5 text-border">·</span>
          <span>2. Toca</span>
          <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-background text-primary shadow-sm">
            <SquarePlus className="size-3" />
          </span>
          <span>&quot;Añadir a inicio&quot;</span>
        </div>
      </div>
    </div>
  );
}
