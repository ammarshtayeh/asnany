import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { notifyDoctorAboutAppointment } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "قاعدة البيانات غير مهيأة" }, { status: 503 });
    }

    const body = await request.json();
    const doctorId = body.doctor_id;
    const patientFullName = body.patient_full_name || body.full_name;
    const patientEmail = body.patient_email || body.email || null;
    const patientPhone = body.patient_phone || body.phone;
    const patientIdentity = body.patient_identity || body.identity;
    const patientAddress = body.patient_address || body.address;
    const date = body.date;
    const time = body.time;
    const notes = body.notes;
    const appointmentKey = time
      ? `${doctorId}:${date}:${time}`
      : `${doctorId}:${date}`;

    if (!doctorId || !patientFullName || !patientPhone || !patientIdentity || !patientAddress || !date) {
      return NextResponse.json(
        { error: "يرجى تعبئة جميع الحقول المطلوبة بما فيها الاسم والهوية والهاتف والعنوان والتاريخ" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("appointments")
      .insert([
        {
          doctor_id: doctorId,
          appointment_key: appointmentKey,
          patient_name: patientFullName,
          patient_full_name: patientFullName,
          patient_email: patientEmail,
          patient_phone: patientPhone,
          patient_identity: patientIdentity,
          patient_address: patientAddress,
          date,
          time: time || null,
          notes: notes || "",
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    await notifyDoctorAboutAppointment(data);
    return NextResponse.json({ success: true, appointment: data });
  } catch (err: any) {
    console.error("Create appointment error:", err);
    if (err?.code === "23505") {
      return NextResponse.json(
        { error: "هذا الموعد محجوز للتو. اختر وقتاً آخر من فضلك." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: err.message || "تعذر إنشاء الحجز" }, { status: 500 });
  }
}
