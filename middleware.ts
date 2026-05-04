// @ts-nocheck
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedApiRoutes = [
  "/api/listings", // POST only
  "/api/chat",
  "/api/orders",
  "/api/payments",
  "/api/reviews",
  "/api/logistics",
  "/api/driver",
  "/api/admin",
  "/api/upload",
  "/api/notifications",
];

export function middleware(request: NextRequest) {
  const { pathname, method } = request.nextUrl;
  const host = request.headers.get("host");

  if (host === "quicksalehub.com") {
    const url = request.nextUrl.clone();
    url.hostname = "www.quicksalehub.com";
    return NextResponse.redirect(url, 308);
  }

  // Only protect API routes that modify data
  if (pathname.startsWith("/api/")) {
    // Allow GET requests to public endpoints
    if (
      request.method === "GET" &&
      (pathname === "/api/listings" || pathname.startsWith("/api/listings/"))
    ) {
      return NextResponse.next();
    }

    // Check auth for protected routes
    const isProtected = protectedApiRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isProtected) {
      const token =
        request.headers.get("Authorization")?.replace("Bearer ", "") ||
        request.cookies.get("token")?.value;

      if (!token) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
