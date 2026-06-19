import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type SessionRole = 'admin' | 'doctor';

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret && process.env.NODE_ENV === 'production') {
    console.error('AUTH_SECRET is missing — set it in Vercel environment variables.');
  }

  return secret || 'development-session-secret';
}

async function verifySignedToken(token: string | undefined, role: SessionRole) {
  if (!token || !token.includes('.')) return false;
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return false;

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(getSessionSecret()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const validSignature = await crypto.subtle.verify('HMAC', key, base64UrlDecode(signature), new TextEncoder().encode(encodedPayload));
    if (!validSignature) return false;

    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedPayload)));
    return payload?.role === role && payload?.sub && payload?.exp >= Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function bearerToken(request: NextRequest) {
  return request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
}

// Basic middleware for admin route protection
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const isAdminApi = pathname.startsWith('/api/admin');

    // Exclude login routes themselves.
    if (pathname === '/admin/login' || pathname === '/api/admin/login') {
      return NextResponse.next();
    }

    const hasValidCookie = await verifySignedToken(request.cookies.get('admin_session')?.value, 'admin');
    const hasValidBearerToken = isAdminApi ? await verifySignedToken(bearerToken(request), 'admin') : false;

    if (!hasValidCookie && !hasValidBearerToken) {
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

    const hasValidCookie = await verifySignedToken(request.cookies.get('doctor_session')?.value, 'doctor');
    const hasValidBearerToken = isDoctorApi ? await verifySignedToken(bearerToken(request), 'doctor') : false;

    if (!hasValidCookie && !hasValidBearerToken) {
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
