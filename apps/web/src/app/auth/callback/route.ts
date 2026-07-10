import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Exchanges the `?code=` from OAuth logins, signup confirmations and
 * password-recovery emails for a session, then redirects to `?next=`.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/mi-cuenta";
  const next = rawNext.startsWith("/") ? rawNext : "/mi-cuenta";

  if (code && isSupabaseConfigured) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // OAuth providers (Google) never hand over phone/birth date — force
      // those through /completar-perfil right here, at the one moment every
      // OAuth user is guaranteed to pass through, rather than relying on
      // them navigating to a page that happens to check for it.
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone, birth_date")
        .eq("id", data.user.id)
        .maybeSingle();
      if (!profile?.phone || !profile?.birth_date) {
        const complete = new URL("/completar-perfil", origin);
        complete.searchParams.set("next", next);
        return NextResponse.redirect(complete);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
