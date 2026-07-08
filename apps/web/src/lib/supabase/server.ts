import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config";

/**
 * RLS-subject (anon key) client for Server Components, Server Actions and
 * Route Handlers. Uses @supabase/ssr's default cookie flags (httpOnly,
 * secure in prod, sameSite=lax) — do not override them.
 */
export async function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase no está configurado (faltan variables de entorno).");
  }
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — safe to ignore, the middleware
          // refreshes sessions.
        }
      },
    },
  });
}

/** Current auth user, or null (also null when Supabase isn't configured). */
export async function getUser() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
