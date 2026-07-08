import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const maintenance = request.cookies.get("conectage_maintenance")?.value;
  const { pathname } = request.nextUrl;

  // Maintenance mode — redirect all public traffic to /maintenance
  if (
    maintenance === "true" &&
    !pathname.startsWith("/maintenance") &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/auth") &&
    !pathname.startsWith("/_next")
  ) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

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

  // Protect admin — requires a real user AND profiles.role === 'admin'.
  if (pathname.startsWith("/admin") && user && supabase) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Complete-your-profile gate: OAuth signups have no phone; posting a
  // listing requires one (it powers the WhatsApp contact button).
  if (pathname.startsWith("/publicar") && user && supabase) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("phone")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.phone) {
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
