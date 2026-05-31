import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic middleware for admin route protection
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const isAdminApi = pathname.startsWith('/api/admin');

    // Exclude login routes themselves.
    if (pathname === '/admin/login' || pathname === '/api/admin/login') {
      return NextResponse.next();
    }

    // Check for a session cookie or auth token
    // For now, doing a basic check for demo purposes.
    // Replace with Supabase session checking in production.
    const hasAuthCookie = request.cookies.has('admin_session');

    if (!hasAuthCookie) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
