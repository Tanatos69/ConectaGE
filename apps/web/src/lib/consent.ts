/**
 * Cookie-consent state, shared between the banner (client) and the pages
 * that log analytics events (server). The choice is stored in a plain cookie
 * (not localStorage) precisely so Server Components can read it via
 * `cookies()` and enforce it — consent here is real gating, not decoration.
 *
 * Semantics:
 * - No cookie yet          → collect nothing (first visit, no decision).
 * - analytics: true        → events logged ANONYMOUSLY (user_id = null).
 * - personalization: true  → events keep the user's own id (implies analytics),
 *                            enabling future personalized features.
 */

import { brandStorageKey, legacyStorageKey } from "@gemarket/shared";

export const CONSENT_COOKIE = brandStorageKey("consent");
/** Pre-rename cookie name — readConsent() migrates it once, then drops it. */
const LEGACY_CONSENT_COOKIE = legacyStorageKey("consent");
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // 12 months

/** Window event fired when /cookies clears the decision, so the banner re-shows. */
export const CONSENT_CLEARED_EVENT = brandStorageKey("consent-cleared");

export interface Consent {
  v: 1;
  analytics: boolean;
  personalization: boolean;
}

export const CONSENT_ALL: Consent = { v: 1, analytics: true, personalization: true };
export const CONSENT_NONE: Consent = { v: 1, analytics: false, personalization: false };

/** Parse a raw cookie value; null = no valid decision recorded. */
export function parseConsent(raw: string | undefined | null): Consent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<Consent>;
    if (parsed.v !== 1) return null;
    const personalization = Boolean(parsed.personalization);
    return {
      v: 1,
      // Personalization implies analytics.
      analytics: Boolean(parsed.analytics) || personalization,
      personalization,
    };
  } catch {
    return null;
  }
}

// ── Client-side helpers (no-ops on the server) ──────────────────────────────

export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const readCookie = (name: string) => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
    return match ? match[1] : null;
  };
  const current = parseConsent(readCookie(CONSENT_COOKIE));
  if (current) return current;
  // One-time migration from the pre-rename cookie name (conectage-consent).
  const legacy = parseConsent(readCookie(LEGACY_CONSENT_COOKIE));
  if (legacy) {
    writeConsent(legacy);
    document.cookie = `${LEGACY_CONSENT_COOKIE}=; path=/; max-age=0; samesite=lax`;
    return legacy;
  }
  return null;
}

export function writeConsent(consent: Consent): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(consent));
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${CONSENT_MAX_AGE}; samesite=lax`;
}

export function clearConsent(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${CONSENT_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
