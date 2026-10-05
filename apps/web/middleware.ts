import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add the routes that require authentication here
const protectedRoutes = ['/dashboard', '/admin'];
// Add routes that should be inaccessible when already logged in
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Check if the user has the secure HttpOnly token cookie
  const token = request.cookies.get('X-Access-Token')?.value;
  const isAuthenticated = !!token;

  // 2. If trying to access a protected route without being authenticated, redirect to /login
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. If trying to access login/register while already authenticated, redirect to /dashboard
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    // Note: If you want Admins to redirect to /admin instead, you'll need to decode the JWT here
    // or rely on a client-side layout redirect since middleware can't easily decode payload without jose library.
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except api, _next/static, _next/image, favicon.ico
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
