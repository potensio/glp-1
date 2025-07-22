import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { stackServerApp } from '@/stack-server';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the pathname is a protected route
  const isProtectedRoute = [
    '/home',
    '/profile',
    '/settings',
  ].some(route => pathname.startsWith(route));
  
  // Check if the pathname is an auth route
  const isAuthRoute = [
    '/login',
    '/signup',
    '/forgot-password',
  ].some(route => pathname === route);
  
  // Get the current user
  const user = await stackServerApp.getUser();
  
  // If the user is not logged in and trying to access a protected route
  if (!user && isProtectedRoute) {
    const url = new URL('/handler/sign-in', request.url);
    url.searchParams.set('after_auth_return_to', encodeURI(pathname));
    return NextResponse.redirect(url);
  }
  
  // If the user is logged in and trying to access an auth route
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/home', request.url));
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/home/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/login',
    '/signup',
    '/forgot-password',
  ],
};