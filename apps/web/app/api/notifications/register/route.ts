import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { getDoctorSession } from "@/lib/doctor-session";
import { getAdminSession } from "@/lib/admin-session";
import { normalizePushPhone } from "@/lib/notifications";
import { rateLimitResponse, withRateLimit } from "@/lib/rate-limit";

function isExpoPushToken(token: string) {
  return /^Expo(nent)?PushToken\[[^\]]+\]$/.test(token);
}

function isWebPushPayload(value: unknown): value is { endpoint: string; keys: { p256dh: string; auth: string } } {
  if (!value || typeof value !== "object") return false;
  const payload = value as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  return Boolean(
    typeof payload.endpoint === "string" &&
      payload.keys &&
      typeof payload.keys.p256dh === "string" &&
      typeof payload.keys.auth === "string"
  );
}

export async function POST(request: Request) {
  try {
    const rate = withRateLimit(request, "notifications-register", 20, 60_000);
    if (!rate.ok) return rateLimitResponse(rate.retryAfter);

    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
    }

    const body = await request.json();
    const doctorSession = await getDoctorSession(request);
    const adminSession = doctorSession ? null : await getAdminSession(request);
    if (body.role === "admin" && !adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = doctorSession ? "doctor" : adminSession && body.role === "admin" ? "admin" : "patient";
    const doctorId = doctorSession?.doctor_id || body.doctor_id || null;
    const patientPhone = role === "patient" ? normalizePushPhone(body.patient_phone || body.phone) || null : null;

    if (role === "patient" && !patientPhone) {
      return NextResponse.json(
        { error: "رقم هاتف المريض مطلوب لتفعيل تنبيهات الحجز" },
        { status: 400 }
      );
    }

    const webPush = body.web_push;
    if (isWebPushPayload(webPush)) {
      const { error } = await supabaseAdmin.from("push_subscriptions").upsert(
        {
          web_endpoint: webPush.endpoint,
          web_p256dh: webPush.keys.p256dh,
          web_auth: webPush.keys.auth,
          expo_push_token: null,
          device_id: body.device_id || null,
          platform: body.platform || "web",
          role,
          doctor_id: role === "doctor" ? doctorId : null,
          patient_phone: patientPhone,
          is_active: true,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "web_endpoint" }
      );

      if (error) throw error;
      return NextResponse.json({ success: true, channel: "web" });
    }

    const token = String(body.expo_push_token || body.token || "");
    if (!isExpoPushToken(token)) {
      return NextResponse.json({ error: "Invalid Expo push token" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("push_subscriptions").upsert(
      {
        expo_push_token: token,
        device_id: body.device_id || null,
        platform: body.platform || null,
        role,
        doctor_id: role === "doctor" ? doctorId : null,
        patient_phone: patientPhone,
        is_active: true,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "expo_push_token" }
    );

    if (error) throw error;
    return NextResponse.json({ success: true, channel: "expo" });
  } catch (err: any) {
    console.error("Register push token error:", err);
    return NextResponse.json({ error: err.message || "Unable to register push token" }, { status: 500 });
  }
}
