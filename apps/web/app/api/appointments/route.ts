import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "قاعدة البيانات غير مهيأة" }, { status: 503 });
    }

    const body = await request.json();
    const {
      doctor_id,
      patient_full_name,
      patient_email,
      patient_phone,
      patient_identity,
      patient_address,
      date,
      time,
      notes,
    } = body;

    if (!doctor_id || !patient_full_name || !patient_email || !patient_phone || !patient_identity || !patient_address || !date) {
      return NextResponse.json({ error: "يرجى تعبئة جميع الحقول المطلوبة بما فيها البريد الإلكتروني" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("appointments")
      .insert([
        {
          doctor_id,
          patient_name: patient_full_name,
          patient_full_name,
          patient_email,
          patient_phone,
          patient_identity,
          patient_address,
          date,
          time: time || null,
          notes: notes || "",
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, appointment: data });
  } catch (err: any) {
    console.error("Create appointment error:", err);
    return NextResponse.json({ error: err.message || "تعذر إنشاء الحجز" }, { status: 500 });
  }
}
