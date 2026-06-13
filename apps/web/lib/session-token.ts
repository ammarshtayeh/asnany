import { createHmac, timingSafeEqual } from "crypto";

export type SessionRole = "admin" | "doctor";

type SessionPayload = {
  sub: string;
  role: SessionRole;
  exp: number;
};

const encoder = new TextEncoder();

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function getSessionSecret() {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production");
  }

  return secret || "development-session-secret";
}

function sign(payload: string) {
  return base64UrlEncode(createHmac("sha256", getSessionSecret()).update(payload).digest());
}

export function createSessionToken({ sub, role, maxAgeSeconds }: { sub: string; role: SessionRole; maxAgeSeconds: number }) {
  const payload: SessionPayload = {
    sub,
    role,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifySessionToken(token: string | undefined | null, role?: SessionRole) {
  if (!token || !token.includes(".")) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = sign(encodedPayload);
  const signatureBuffer = encoder.encode(signature);
  const expectedBuffer = encoder.encode(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    if (!payload.sub || !payload.role || !payload.exp) return null;
    if (role && payload.role !== role) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
