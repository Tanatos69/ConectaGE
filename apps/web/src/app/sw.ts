/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Admin backoffice: never serve a cached response, even as an offline
    // fallback — moderation/admin actions must always see live state.
    // defaultCache's own rules are otherwise NetworkFirst everywhere
    // (fresh data whenever online; cache is only an offline emergency
    // fallback), which is already safe for the public marketplace pages.
    {
      matcher: ({ url }) => url.pathname.startsWith("/admin"),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

self.addEventListener("push", (event) => {
  const data = JSON.parse(event.data?.text() ?? "{}") as {
    title?: string;
    message?: string;
    url?: string;
  };
  event.waitUntil(
    self.registration.showNotification(data.title ?? "GEMarket", {
      body: data.message ?? "",
      icon: "/icon-192.png",
      data: { url: data.url ?? "/mi-cuenta/notificaciones" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data?.url as string | undefined) ?? "/mi-cuenta/notificaciones";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client && client.url.includes(targetUrl)) {
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
