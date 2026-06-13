import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getDoctorSession } from "@/lib/doctor-session";
import { notifyPatientAboutAppointmentStatus } from "@/lib/notifications";
import { attachDiscountCardStatus, isMissingDiscountMemberTable } from "@/lib/discount-card-members";

export async function GET(request: Request) {
  try {
    const session = await getDoctorSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from("appointments")
      .select("*")
      .eq("doctor_id", session.doctor_id)
      .order("date", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    let appointments = data || [];
    const { data: members, error: membersError } = await supabaseAdmin
      .from("discount_card_members")
      .select("*")
      .eq("status", "active");

    if (membersError) {
      if (!isMissingDiscountMemberTable(membersError)) throw membersError;
    } else {
      appointments = attachDiscountCardStatus(data || [], members || []);
    }

    return NextResponse.json({ success: true, appointments });
  } catch (err: any) {
    console.error("Doctor appointments list error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحميل مواعيد الطبيب" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getDoctorSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, appointment_id, status } = await request.json();
    const appointmentId = id || appointment_id;
    if (!appointmentId || !status) {
      return NextResponse.json({ error: "معرف الموعد والحالة مطلوبان" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId)
      .eq("doctor_id", session.doctor_id)
      .select()
      .single();

    if (error) throw error;
    await notifyPatientAboutAppointmentStatus(data);
    return NextResponse.json({ success: true, appointment: data });
  } catch (err: any) {
    console.error("Doctor appointment update error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحديث الموعد" }, { status: 500 });
  }
}
