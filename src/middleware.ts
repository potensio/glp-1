import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  // Skip middleware for static assets only (not API routes)
  if (
    request.nextUrl.pathname.startsWith("/_next/") ||
    (request.nextUrl.pathname.includes(".") &&
      !request.nextUrl.pathname.startsWith("/api/"))
  ) {
    return NextResponse.next();
  }

  // Check authentication for auth routes
  const token = request.cookies.get("auth-token")?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      await jwtVerify(token, secret);
      isAuthenticated = true;
    } catch (error) {
      // Token is invalid or expired
      isAuthenticated = false;
    }
  }

  // Handle custom auth routes - redirect authenticated users to home (except reset-password)
  if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname.startsWith("/forgot-password")
  ) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.next();
  }

  // Allow reset-password page for both authenticated and unauthenticated users
  if (request.nextUrl.pathname.startsWith("/reset-password")) {
    return NextResponse.next();
  }

  // Handle Stack Auth handler routes - let them pass through (for backend auth processing)
  if (request.nextUrl.pathname.startsWith("/handler")) {
    return NextResponse.next();
  }

  // Handle API routes - let them pass through but preserve auth context
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Authentication check already done above for auth routes

  // Protect /home and /billing routes - redirect to custom login if not authenticated
  if (
    request.nextUrl.pathname.startsWith("/home") ||
    request.nextUrl.pathname.startsWith("/billing")
  ) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Allow public access to root page and privacy page
  if (
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/privacy"
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/privacy",
    "/terms",
    "/home/:path*",
    "/billing/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/handler/:path*",
    // Exclude Stripe webhooks from middleware to allow signature verification
    "/((?!api/stripe/webhooks).*)",
  ],
};
