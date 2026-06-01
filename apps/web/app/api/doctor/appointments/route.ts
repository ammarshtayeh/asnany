import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getDoctorSession } from "@/lib/doctor-session";

export async function PATCH(request: Request) {
  try {
    const session = await getDoctorSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: "معرف الموعد والحالة مطلوبان" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("appointments")
      .update({ status })
      .eq("id", id)
      .eq("doctor_id", session.doctor_id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, appointment: data });
  } catch (err: any) {
    console.error("Doctor appointment update error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحديث الموعد" }, { status: 500 });
  }
}
