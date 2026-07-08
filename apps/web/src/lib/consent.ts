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

export const CONSENT_COOKIE = "conectage-consent";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // 12 months

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
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]+)`),
  );
  return parseConsent(match ? match[1] : null);
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
