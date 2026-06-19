type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false as const,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true as const, remaining: limit - bucket.count, retryAfter: 0 };
}

export function rateLimitResponse(retryAfter: number) {
  return new Response(
    JSON.stringify({ error: "طلبات كثيرة. حاول بعد قليل." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    }
  );
}

export function withRateLimit(
  request: Request,
  routeKey: string,
  limit: number,
  windowMs: number
) {
  const ip = getClientIp(request);
  return checkRateLimit(`${routeKey}:${ip}`, limit, windowMs);
}
