/**
 * Mirrors apps/web/src/lib/oauth-providers.ts — which providers have real
 * credentials configured in Supabase (Auth → Providers). Hides the button
 * rather than showing one that fails with "Unsupported provider".
 */
const ENABLED = new Set(
  (process.env.EXPO_PUBLIC_OAUTH_PROVIDERS ?? "")
    .split(",")
    .map((p: string) => p.trim().toLowerCase())
    .filter(Boolean),
);

export function isOAuthProviderEnabled(provider: "google" | "facebook"): boolean {
  return ENABLED.has(provider);
}

export const anyOAuthProviderEnabled = ENABLED.size > 0;
