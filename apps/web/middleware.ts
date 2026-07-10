import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Maintenance mode is enforced by the (public) layout from the
  // site_settings table (the old cookie approach only ever set the cookie in
  // the admin's own browser, so visitors never saw the maintenance page).

  // Refreshes the Supabase session and validates the JWT server-side
  // (supabase.auth.getUser()) — unlike the old raw cookie string check.
  const { response, user, supabase } = await updateSession(request);

  const needsAuth =
    pathname.startsWith("/mi-cuenta") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/publicar");

  if (needsAuth && !user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  // Single profile lookup shared by every gate below — was two separate
  // round trips (admin role, then completeness); now one, plus the new
  // blocked-account check.
  let profile: {
    role: string;
    phone: string | null;
    birth_date: string | null;
    blocked_at: string | null;
  } | null = null;
  if (user && supabase) {
    const { data } = await supabase
      .from("profiles")
      .select("role, phone, birth_date, blocked_at")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  // Blocked account — kicked out of everywhere except the small allowlist
  // needed to sign out and see why. Applies broadly (not just account-
  // specific routes), since "blocked" is meant to mean blocked everywhere.
  const blockedAllowlist =
    pathname.startsWith("/cuenta-bloqueada") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next");
  if (user && profile?.blocked_at && !blockedAllowlist) {
    return NextResponse.redirect(new URL("/cuenta-bloqueada", request.url));
  }

  // Protect admin — requires a real user AND profiles.role === 'admin'.
  if (pathname.startsWith("/admin") && user) {
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Complete-your-profile gate: OAuth signups have no phone or birth date
  // (Google never hands those over). The auth callback already catches this
  // on first login; this is defense-in-depth for anyone who reaches a
  // gated page another way (bookmark, shared link) with an incomplete
  // profile. /mi-cuenta covers browsing/managing the account; /publicar
  // covers posting — both require a real WhatsApp number and the 16+ check.
  if ((pathname.startsWith("/publicar") || pathname.startsWith("/mi-cuenta")) && user) {
    if (!profile?.phone || !profile?.birth_date) {
      const complete = new URL("/completar-perfil", request.url);
      complete.searchParams.set("next", pathname);
      return NextResponse.redirect(complete);
    }
  }

  // Must return the Supabase-provided response so refreshed auth cookies
  // aren't dropped.
  return response;
}

export const config = {
  matcher: [
    "/mi-cuenta/:path*",
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|demo/).*)",
  ],
};
