import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/**
 * Service-role client — BYPASSES Row Level Security.
 *
 * Only ever import this from server actions in `lib/actions/admin.ts` or
 * admin route handlers. Never from a "use client" file. An ESLint
 * `no-restricted-imports` rule enforces this at lint time, and the
 * `server-only` import makes any client-bundle inclusion a build error.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no está configurada.");
  }
  return createSupabaseClient(SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
