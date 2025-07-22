import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Skip middleware for static assets and API routes to improve performance
  if (
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.includes('.') ||
    request.nextUrl.pathname.startsWith('/@vite/')
  ) {
    return NextResponse.next();
  }

  // Handle Stack Auth routes - let them pass through
  if (request.nextUrl.pathname.startsWith("/handler")) {
    return NextResponse.next();
  }

  // For now, let all routes pass through to avoid auth overhead in middleware
  // Authentication will be handled client-side for better performance
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/login",
    "/signup", 
    "/forgot-password",
    "/handler/:path*"
  ],
};
