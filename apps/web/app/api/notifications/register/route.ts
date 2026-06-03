import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { getDoctorSession } from "@/lib/doctor-session";
import { normalizePushPhone } from "@/lib/notifications";

function isExpoPushToken(token: string) {
  return /^Expo(nent)?PushToken\[[^\]]+\]$/.test(token);
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
    }

    const body = await request.json();
    const token = String(body.expo_push_token || body.token || "");
    if (!isExpoPushToken(token)) {
      return NextResponse.json({ error: "Invalid Expo push token" }, { status: 400 });
    }

    const session = await getDoctorSession(request);
    const role = session ? "doctor" : body.role === "admin" ? "admin" : "patient";
    const doctorId = session?.doctor_id || body.doctor_id || null;
    const patientPhone = role === "patient" ? normalizePushPhone(body.patient_phone || body.phone) || null : null;

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
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Register push token error:", err);
    return NextResponse.json({ error: err.message || "Unable to register push token" }, { status: 500 });
  }
}
