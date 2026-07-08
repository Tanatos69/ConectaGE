import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./config";

/**
 * Standard @supabase/ssr middleware pattern: refreshes the session cookie and
 * returns the response that MUST be forwarded (it carries the refreshed auth
 * cookies), plus the verified user and a request-scoped client for extra
 * lookups (e.g. the admin role check).
 */
export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: User | null;
  supabase: ReturnType<typeof createServerClient> | null;
}> {
  if (!isSupabaseConfigured) {
    return { response: NextResponse.next({ request }), user: null, supabase: null };
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() validates the JWT against Supabase Auth server-side — unlike
  // the old cookie string comparison, this cannot be spoofed client-side.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user, supabase };
}
