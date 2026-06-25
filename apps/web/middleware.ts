import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("conectage-session")?.value;
  const maintenance = request.cookies.get("conectage_maintenance")?.value;
  const { pathname } = request.nextUrl;

  // Maintenance mode — redirect all public traffic to /maintenance
  if (
    maintenance === "true" &&
    !pathname.startsWith("/maintenance") &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next")
  ) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  // Protect user dashboard — any logged-in user
  if (pathname.startsWith("/mi-cuenta")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login?next=/mi-cuenta", request.url));
    }
  }

  // Protect admin — only admin role
  if (pathname.startsWith("/admin")) {
    if (session !== "admin") {
      return NextResponse.redirect(new URL("/login?next=/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/mi-cuenta/:path*",
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|demo/).*)",
  ],
};
