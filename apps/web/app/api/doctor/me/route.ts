import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getDoctorSession } from "@/lib/doctor-session";

export async function GET(request: Request) {
  try {
    const session = await getDoctorSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: appointments, error } = await supabaseAdmin
      .from("appointments")
      .select("*")
      .eq("doctor_id", session.doctor_id)
      .order("date", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      account: { id: session.id, email: session.email },
      doctor: Array.isArray(session.doctors) ? session.doctors[0] : session.doctors,
      appointments: appointments || [],
    });
  } catch (err: any) {
    console.error("Doctor me error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحميل بيانات الطبيب" }, { status: 500 });
  }
}
