import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config";

/**
 * Browser client for client components (OAuth redirects, auth-state
 * subscription, direct-to-Storage photo uploads). Callers must check
 * `isSupabaseConfigured` before using it.
 */
export function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase no está configurado (faltan variables de entorno).");
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
