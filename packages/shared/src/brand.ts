/**
 * Single source of truth for the product's brand identity — shared by the web
 * app, the mobile app, and (via 0019_rebrand.sql) the database seed.
 *
 * Renaming the product = editing this file. The one place it can't reach is
 * apps/mobile/app.json (static JSON, loaded before any JS runs);
 * `apps/mobile/scripts/check-brand.mjs` fails the build if that file drifts
 * from the values here.
 *
 * History: launched as "ConectaGE", renamed to "GEMarket" (2026-08) after a
 * naming dispute. `legacySlug` is what the pre-rename client-storage keys and
 * deep-link scheme used — the migration shims in web/mobile read it once.
 */

export const BRAND = {
  /** Display name / wordmark. */
  name: "GEMarket",
  /** Legal entity name used on the terms & privacy pages. */
  legalName: "GEMarket",
  /** Registered-office city, shown in the privacy policy. */
  legalCity: "Malabo",

  /**
   * Two-tone wordmark: `accent` renders in the primary colour, `rest` in the
   * foreground colour (see the web Logo component). A name with no natural
   * split can set `accent: ""`, and the logo falls back to a plain wordmark.
   */
  wordmark: { accent: "GE", rest: "Market" },

  /**
   * lowercase, no spaces — the machine identifier. Drives the deep-link
   * scheme, the app id, the npm scope (@gemarket/shared), the client-storage
   * key prefix and the docker container name.
   */
  slug: "gemarket",
  /** Pre-rename slug — only the storage / deep-link migration shims use this. */
  legacySlug: "conectage",

  /**
   * Public website URL, no trailing slash. Per-env override:
   * NEXT_PUBLIC_SITE_URL (web) / EXPO_PUBLIC_WEB_URL (mobile).
   * TODO(domain): point at the real gemarket.* domain once it is registered
   * and wired up as a Netlify custom domain.
   */
  url: "https://conectage.netlify.app",

  /** Custom URI scheme for mobile deep links (gemarket://…). */
  deepLinkScheme: "gemarket",
  /** iOS bundle identifier / Android application id. */
  appId: "com.gemarket.app",

  /**
   * Contact addresses shown on the site and used as the web-push sender.
   * TODO(domain): move to @gemarket.* once the domain's mail is set up.
   */
  emails: {
    info: "info@conectage.com",
    legal: "legal@conectage.com",
    privacy: "privacidad@conectage.com",
  },

  /** Default support WhatsApp (admin can override via site_settings.site_whatsapp). */
  whatsapp: "+240 222 000 000",
} as const;

/** `gemarket-<suffix>` — canonical name for a client-storage key or cookie. */
export function brandStorageKey(suffix: string): string {
  return `${BRAND.slug}-${suffix}`;
}

/** `conectage-<suffix>` — pre-rename key name, for one-time read-through migration. */
export function legacyStorageKey(suffix: string): string {
  return `${BRAND.legacySlug}-${suffix}`;
}
