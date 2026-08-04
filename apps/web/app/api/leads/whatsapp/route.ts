import { NextResponse } from "next/server";
import { rateLimitResponse, withRateLimit } from "@/lib/rate-limit";

/**
 * Lightweight WhatsApp lead beacon — stores nothing sensitive.
 * Accepts POST and returns 204 so UI never blocks on analytics.
 */
export async function POST(request: Request) {
  try {
    const rate = withRateLimit(request, "wa-lead", 40, 60_000);
    if (!rate.ok) return rateLimitResponse(rate.retryAfter);

    const body = await request.json().catch(() => ({}));
    console.info("[whatsapp_lead]", {
      doctor_id: body?.doctor_id || null,
      doctor_name: body?.doctor_name || null,
      source: body?.source || null,
      path: body?.path || null,
      at: body?.at || new Date().toISOString(),
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
