import { NextResponse } from "next/server";
import { getDoctorSession } from "@/lib/doctor-session";
import { getAdminSession } from "@/lib/admin-session";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

function parseLimit(value: string | null) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 20;
  return Math.min(parsed, 100);
}

export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, notifications: [] });
    }

    const doctorSession = await getDoctorSession(request);
    const adminSession = doctorSession ? null : await getAdminSession(request);
    if (!doctorSession && !adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseLimit(url.searchParams.get("limit"));
    const unreadOnly = url.searchParams.get("unread") === "true";

    let query = supabaseAdmin
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (doctorSession) {
      query = query.eq("recipient_role", "doctor").eq("doctor_id", doctorSession.doctor_id);
    } else {
      query = query.eq("recipient_role", "admin");
    }

    if (unreadOnly) {
      query = query.is("read_at", null);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, notifications: data || [] });
  } catch (err: any) {
    console.error("Notifications list error:", err);
    return NextResponse.json({ error: err.message || "Unable to load notifications" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true });
    }

    const doctorSession = await getDoctorSession(request);
    const adminSession = doctorSession ? null : await getAdminSession(request);
    if (!doctorSession && !adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids.map((item: unknown) => String(item)).filter(Boolean) : body.id ? [String(body.id)] : [];

    if (!ids.length) {
      return NextResponse.json({ error: "Notification id is required" }, { status: 400 });
    }

    let query = supabaseAdmin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", ids)
      .eq("recipient_role", doctorSession ? "doctor" : "admin");

    if (doctorSession) {
      query = query.eq("doctor_id", doctorSession.doctor_id);
    }

    const { error } = await query;

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Notifications mark-read error:", err);
    return NextResponse.json({ error: err.message || "Unable to update notifications" }, { status: 500 });
  }
}
