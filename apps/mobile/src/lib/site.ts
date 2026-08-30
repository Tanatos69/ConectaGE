import { BRAND } from "@gemarket/shared";

/**
 * Public website base URL — legal/help pages are shown in an in-app WebView
 * (no duplication of the web content) and paid upgrades are completed on the
 * website (display-only monetization on mobile, avoiding the store 30% cut).
 * Override with EXPO_PUBLIC_WEB_URL for staging/prod domains; default from BRAND.
 */
export const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL ?? BRAND.url).replace(/\/$/, "");

export const webPath = (path: string) => `${WEB_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Info/legal pages hosted on the web app, surfaced via the WebView screen. */
export const INFO_PAGES = {
  ayuda: { path: "/ayuda", title: "Ayuda" },
  terminos: { path: "/terminos", title: "Términos y condiciones" },
  privacidad: { path: "/privacidad", title: "Privacidad" },
  cookies: { path: "/cookies", title: "Cookies" },
  sobreNosotros: { path: "/sobre-nosotros", title: "Sobre nosotros" },
  contacto: { path: "/contacto", title: "Contacto" },
  pagos: { path: "/pagos-y-envios", title: "Pagos y envíos" },
} as const;
