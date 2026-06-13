import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getDoctorSession } from "@/lib/doctor-session";
import { attachDiscountCardStatus, isMissingDiscountMemberTable } from "@/lib/discount-card-members";

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

    let appointmentsWithDiscountStatus = appointments || [];
    const { data: members, error: membersError } = await supabaseAdmin
      .from("discount_card_members")
      .select("*")
      .eq("status", "active");

    if (membersError) {
      if (!isMissingDiscountMemberTable(membersError)) throw membersError;
    } else {
      appointmentsWithDiscountStatus = attachDiscountCardStatus(appointments || [], members || []);
    }

    return NextResponse.json({
      success: true,
      account: { id: session.id, email: session.email },
      doctor: Array.isArray(session.doctors) ? session.doctors[0] : session.doctors,
      appointments: appointmentsWithDiscountStatus,
    });
  } catch (err: any) {
    console.error("Doctor me error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحميل بيانات الطبيب" }, { status: 500 });
  }
}
