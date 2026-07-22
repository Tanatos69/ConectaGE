/**
 * Shared Supabase env access, mirroring apps/web/src/lib/supabase/config.ts.
 * EXPO_PUBLIC_ vars are inlined into the bundle by Expo/Metro the same way
 * NEXT_PUBLIC_ vars are by Next.
 */
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const NOT_CONFIGURED_ERROR =
  "El servidor de cuentas aún no está configurado. Inténtalo más tarde.";
