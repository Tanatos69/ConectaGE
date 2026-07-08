/**
 * Shared Supabase env access. NEXT_PUBLIC_ vars must be referenced as static
 * property accesses so Next can inline them into client bundles.
 *
 * `isSupabaseConfigured` lets the app build and run before the Supabase
 * project exists: queries fall back to the demo data and auth actions return
 * a clear "not configured" error instead of crashing at import time.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const NOT_CONFIGURED_ERROR =
  "El servidor de cuentas aún no está configurado. Inténtalo más tarde.";
