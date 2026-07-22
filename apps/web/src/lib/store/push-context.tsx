"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isStandalone } from "@/lib/pwa/standalone";

interface PushValue {
  /** False until browser support + (on iOS) the home-screen-install gate are confirmed. */
  available: boolean;
  subscribed: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

const PushContext = createContext<PushValue>({
  available: false,
  subscribed: false,
  subscribe: async () => {},
  unsubscribe: async () => {},
});

// Uint8Array<ArrayBufferLike> (the return type of `new Uint8Array(n)`) isn't
// assignable to PushManager.subscribe()'s stricter `ArrayBufferView<ArrayBuffer>`
// parameter type — allocating from an explicit ArrayBuffer keeps the generic
// pinned to ArrayBuffer instead of the wider ArrayBufferLike.
function base64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(b64);
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

/**
 * Server-backed push subscriptions (push_subscriptions table), same
 * own-row-insert pattern as favorites/follows. iOS Safari only allows
 * PushManager.subscribe() once the app is already added to the home screen
 * — calling it earlier silently rejects — so `available` additionally gates
 * on isStandalone() there (Android/desktop have no such restriction).
 */
export function PushProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [rawSubscribed, setRawSubscribed] = useState(false);
  const [iosGateOk, setIosGateOk] = useState(true);

  useEffect(() => {
    const iosDevice = /iP(hone|od|ad)/.test(navigator.userAgent);
    setIosGateOk(!iosDevice || isStandalone());

    if (!user || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    let cancelled = false;
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => {
        if (cancelled) return;
        setRegistration(reg);
        setRawSubscribed(!!sub);
      }),
    );
    return () => {
      cancelled = true;
    };
  }, [user]);

  const supported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
  const available = !!user && supported && iosGateOk;
  const subscribed = available && rawSubscribed;

  async function subscribe() {
    if (!user || !registration || !isSupabaseConfigured) return;
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(publicKey),
    });
    const json = sub.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;
    await createClient()
      .from("push_subscriptions")
      .insert({ user_id: user.id, endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth });
    setRawSubscribed(true);
  }

  async function unsubscribe() {
    if (!registration) return;
    const sub = await registration.pushManager.getSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      if (isSupabaseConfigured) {
        await createClient().from("push_subscriptions").delete().eq("endpoint", endpoint);
      }
    }
    setRawSubscribed(false);
  }

  return (
    <PushContext.Provider value={{ available, subscribed, subscribe, unsubscribe }}>
      {children}
    </PushContext.Provider>
  );
}

export function usePush() {
  return useContext(PushContext);
}
