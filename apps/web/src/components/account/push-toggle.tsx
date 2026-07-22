"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { usePush } from "@/lib/store/push-context";

/**
 * The subscription's mere existence in push_subscriptions IS the on/off
 * state — there's no separate preferences-table column to keep in sync.
 */
export function PushToggle() {
  const { available, subscribed, subscribe, unsubscribe } = usePush();
  const [pending, setPending] = useState(false);

  if (!available) return null;

  async function toggle() {
    setPending(true);
    try {
      if (subscribed) await unsubscribe();
      else await subscribe();
    } catch {
      // Notification.requestPermission denial or an unsupported browser
      // both throw here — nothing to recover, the button just stays off.
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          {subscribed ? <Bell className="size-4 text-primary" /> : <BellOff className="size-4 text-muted-foreground" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Notificaciones push</p>
          <p className="text-xs text-muted-foreground">
            {subscribed ? "Activadas en este dispositivo." : "Recibe avisos aunque no tengas la app abierta."}
          </p>
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={pending}
        className="shrink-0 rounded-xl border border-input bg-background px-3.5 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-60"
      >
        {subscribed ? "Desactivar" : "Activar"}
      </button>
    </div>
  );
}
