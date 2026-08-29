"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, Store, X } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { setOnboardingIntentAction } from "@/lib/actions/auth";

/**
 * One-time "¿comprar o vender?" screen shown after first login — the OLX/
 * Wallapop pattern (ask intent post-signup, not on the signup form itself,
 * so the form stays short). "Quiero vender" routes into the real seller-
 * request flow at /mi-cuenta/tienda: that IS how a buyer asks permission to
 * become a seller on this platform, not a separate concept.
 */
export function OnboardingIntentModal() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [pending, startTransition] = useTransition();

  // Never stack on top of the OAuth complete-your-profile flow, never show
  // to logged-out visitors or once the user has already answered, and never
  // ask an admin or an already-approved seller whether they want to buy or
  // sell — 'buyer' is everyone's default/unset state, so it's the only role
  // where the question still makes sense.
  if (
    !user ||
    !profile ||
    profile.onboarding_intent ||
    profile.role !== "buyer" ||
    pathname === "/completar-perfil"
  ) {
    return null;
  }
  if (dismissed) return null;

  function choose(intent: "buyer" | "seller" | "skipped") {
    setDismissed(true);
    startTransition(async () => {
      await setOnboardingIntentAction(intent);
      if (intent === "buyer") router.push("/categorias");
      else if (intent === "seller") router.push("/mi-cuenta/tienda");
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={() => choose("skipped")}
      />
      <div className="relative w-full max-w-sm rounded-2xl border bg-card p-6 text-center shadow-2xl">
        <button
          type="button"
          aria-label="Cerrar"
          onClick={() => choose("skipped")}
          disabled={pending}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
        >
          <X className="size-4" />
        </button>

        <h2 className="mt-2 text-lg font-bold text-foreground">¡Bienvenido a GEMarket! 🎉</h2>
        <p className="mt-1 text-sm text-muted-foreground">¿Qué quieres hacer?</p>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            disabled={pending}
            onClick={() => choose("buyer")}
            className="flex w-full items-center gap-3 rounded-xl border border-input bg-background px-4 py-3.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">Quiero comprar</span>
              <span className="block text-xs text-muted-foreground">Explora miles de anuncios</span>
            </span>
          </button>

          <button
            type="button"
            disabled={pending}
            onClick={() => choose("seller")}
            className="flex w-full items-center gap-3 rounded-xl border border-input bg-background px-4 py-3.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Store className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">Quiero vender</span>
              <span className="block text-xs text-muted-foreground">Abre tu tienda en GEMarket</span>
            </span>
          </button>
        </div>

        <button
          type="button"
          disabled={pending}
          onClick={() => choose("skipped")}
          className="mt-4 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Omitir por ahora
        </button>
      </div>
    </div>
  );
}
