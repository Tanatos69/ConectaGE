import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("conectage-session")?.value;
  const { pathname } = request.nextUrl;

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
  matcher: ["/mi-cuenta/:path*", "/admin/:path*"],
};
