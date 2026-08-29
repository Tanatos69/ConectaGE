import { createClient } from "@supabase/supabase-js";

/** Minimal async key-value storage shape — matches AsyncStorage's API. */
export interface SupabaseAuthStorage {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}

/**
 * Platform-agnostic Supabase client factory built on plain
 * @supabase/supabase-js. apps/web keeps its own @supabase/ssr-based clients
 * (cookie session sync, not portable to React Native) — this factory exists
 * for apps/mobile, which passes an AsyncStorage-backed `storage` adapter.
 */
export function createSupabaseClient(options: {
  url: string;
  anonKey: string;
  storage?: SupabaseAuthStorage;
}) {
  if (!options.url || !options.anonKey) {
    throw new Error("Supabase no está configurado (faltan variables de entorno).");
  }
  return createClient(options.url, options.anonKey, {
    auth: {
      storage: options.storage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      // PKCE (not the default "implicit" flow) is what makes OAuth/email
      // redirects come back with a ?code= param, which is what the
      // deep-link callback route exchanges via exchangeCodeForSession.
      flowType: "pkce",
    },
  });
}
