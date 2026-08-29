import type { MetadataRoute } from "next";
import { BRAND } from "@gemarket/shared";

// Manifest strings are hardcoded Spanish, matching the SSR default
// (`<html lang="es">` in layout.tsx) and the admin-is-Spanish-only
// precedent (src/lib/i18n/types.ts) — the OS install UI reads this file
// before any client JS runs, so there's no way to vary it by the
// client-side i18n language choice even if we wanted to.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — Compra y vende en Guinea Ecuatorial`,
    short_name: BRAND.name,
    description: "El mercado de anuncios clasificados de Guinea Ecuatorial.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563EB",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
