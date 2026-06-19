import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { notifyDoctorAboutAppointment } from "@/lib/notifications";

function normalizePhone(phone?: string | null) {
  return (phone || "").replace(/[^0-9]/g, "");
}

function escapeIlike(value: string) {
  return value.replace(/[%_]/g, (match) => `\\${match}`);
}

const MIN_PHONE_DIGITS = 9;

export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, appointments: [] });
    }

    const { searchParams } = new URL(request.url);
    const rawPhone = searchParams.get("phone") || searchParams.get("query") || "";
    const identityLast4 = (searchParams.get("identity_last4") || "").replace(/[^0-9]/g, "");
    const phone = normalizePhone(rawPhone);

    if (phone.length < MIN_PHONE_DIGITS) {
      return NextResponse.json({ error: "أدخل رقم هاتف كامل (9 أرقام على الأقل)" }, { status: 400 });
    }

    const candidates = Array.from(new Set([rawPhone.trim(), phone].filter(Boolean)));
    let query = supabaseAdmin
      .from("appointments")
      .select("*, doctors(name, city, area, phone, whatsapp)")
      .in("patient_phone", candidates)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(30);

    if (identityLast4.length === 4) {
      query = query.ilike("patient_identity", `%${escapeIlike(identityLast4)}`);
    }

    const { data, error } = await query;

    if (error) throw error;

    let appointments = data || [];
    if (identityLast4.length === 4) {
      appointments = appointments.filter((row) => {
        const identity = normalizePhone(String(row.patient_identity || ""));
        return identity.slice(-4) === identityLast4;
      });
    }

    return NextResponse.json({ success: true, appointments });
  } catch (err: any) {
    console.error("Patient appointments list error:", err);
    return NextResponse.json({ error: err.message || "تعذر جلب الحجوزات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "قاعدة البيانات غير مهيأة" }, { status: 503 });
    }

    const body = await request.json();
    const doctorId = body.doctor_id;
    const patientFullName = body.patient_full_name || body.full_name;
    const patientEmail = body.patient_email || body.email || null;
    const patientPhone = normalizePhone(body.patient_phone || body.phone);
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

    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from("doctors")
      .select("id, verified, name")
      .eq("id", doctorId)
      .single();

    if (doctorError || !doctor) {
      return NextResponse.json({ error: "الطبيب غير موجود" }, { status: 404 });
    }

    if (!doctor.verified) {
      return NextResponse.json(
        { error: "هذا الطبيب/العيادة لم تُعتمد بعد من الإدارة. لا يمكن الحجز حالياً." },
        { status: 403 }
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
