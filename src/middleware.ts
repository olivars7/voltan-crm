import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hasAuthCookie = request.cookies.has('auth');
  const { pathname } = request.nextUrl;

  // If user is on the login page
  if (pathname.startsWith('/login')) {
    if (hasAuthCookie) {
      // If authenticated, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // If not authenticated, allow access to login page
    return NextResponse.next();
  }

  // For any other page
  if (!hasAuthCookie) {
    // If not authenticated, redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If authenticated, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
