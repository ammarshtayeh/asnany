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
    const hasBearerToken = Boolean(request.headers.get('authorization')?.match(/^Bearer\s+.+$/i));

    if (!hasAuthCookie && !(isAdminApi && hasBearerToken)) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith('/doctor') || pathname.startsWith('/api/doctor')) {
    const isDoctorApi = pathname.startsWith('/api/doctor');

    if (pathname === '/doctor/login' || pathname === '/api/doctor/login') {
      return NextResponse.next();
    }

    const hasDoctorCookie = request.cookies.has('doctor_session');
    const hasBearerToken = Boolean(request.headers.get('authorization')?.match(/^Bearer\s+.+$/i));

    if (!hasDoctorCookie && !(isDoctorApi && hasBearerToken)) {
      if (isDoctorApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const loginUrl = new URL('/doctor/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/doctor/:path*', '/api/doctor/:path*'],
};
