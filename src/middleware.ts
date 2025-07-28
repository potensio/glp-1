import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  // Skip middleware for static assets only (not API routes)
  if (
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.includes('.') && !request.nextUrl.pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  // Check authentication for auth routes
  const token = request.cookies.get('auth-token')?.value;
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

  // Handle custom auth routes - redirect authenticated users to home
  if (request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/register") ||
      request.nextUrl.pathname.startsWith("/forgot-password")) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
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
  if (request.nextUrl.pathname.startsWith('/home') || request.nextUrl.pathname.startsWith('/billing')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Redirect authenticated users from root to home
  if (request.nextUrl.pathname === '/' && isAuthenticated) {
    return NextResponse.redirect(new URL('/home', request.url));
  }
  
  // Redirect unauthenticated users from root to custom login
  if (request.nextUrl.pathname === '/' && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/home/:path*",
    "/billing/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/handler/:path*",
    "/api/:path*"
  ],
};
