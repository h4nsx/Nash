import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/admin'];
const authRoutes = ['/login', '/register'];

function extractRoleFromJwt(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    const payload = JSON.parse(json) as Record<string, unknown>;
    const roleClaim =
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
      payload.role;
    return typeof roleClaim === 'string' ? roleClaim : null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('X-Access-Token')?.value;
  const isAuthenticated = Boolean(token);
  const role = token ? extractRoleFromJwt(token) : null;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && role) {
    if (pathname.startsWith('/admin') && role !== 'Admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/dashboard/client') && role !== 'Client') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (
      (pathname.startsWith('/dashboard/skills') || pathname.startsWith('/dashboard/profile')) &&
      role === 'Client'
    ) {
      return NextResponse.redirect(new URL('/dashboard/client/profile', request.url));
    }
  }

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    if (role === 'Admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
