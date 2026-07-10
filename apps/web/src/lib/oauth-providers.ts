/**
 * Which OAuth providers actually have credentials configured in Supabase
 * (Auth → Providers). Showing a button for an unconfigured provider fails
 * with "Unsupported provider: provider is not enabled" at click time — this
 * flag keeps that failure from ever reaching a real user.
 *
 * Set as a comma-separated list, e.g. NEXT_PUBLIC_OAUTH_PROVIDERS=google
 * once you've created the OAuth app and enabled it in Supabase. Empty/unset
 * hides all social buttons (fails safe).
 */
const ENABLED = new Set(
  (process.env.NEXT_PUBLIC_OAUTH_PROVIDERS ?? "")
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean),
);

export function isOAuthProviderEnabled(provider: "google" | "facebook"): boolean {
  return ENABLED.has(provider);
}

export const anyOAuthProviderEnabled = ENABLED.size > 0;
