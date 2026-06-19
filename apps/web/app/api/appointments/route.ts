import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { notifyDoctorAboutAppointment } from "@/lib/notifications";
import { rateLimitResponse, withRateLimit } from "@/lib/rate-limit";

function normalizePhone(phone?: string | null) {
  return (phone || "").replace(/[^0-9]/g, "");
}

const MIN_PHONE_DIGITS = 9;

function sanitizeAppointment(row: Record<string, unknown>) {
  const doctors = row.doctors as Record<string, unknown> | null | undefined;
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    status: row.status,
    notes: row.notes || null,
    doctors: doctors
      ? {
          name: doctors.name,
          city: doctors.city,
          area: doctors.area,
          phone: doctors.phone,
          whatsapp: doctors.whatsapp,
        }
      : null,
  };
}

export async function GET(request: Request) {
  try {
    const rate = withRateLimit(request, "appointments-get", 12, 60_000);
    if (!rate.ok) return rateLimitResponse(rate.retryAfter);

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, appointments: [] });
    }

    const { searchParams } = new URL(request.url);
    const rawPhone = searchParams.get("phone") || searchParams.get("query") || "";
    const phone = normalizePhone(rawPhone);

    if (phone.length < MIN_PHONE_DIGITS) {
      return NextResponse.json({ error: "أدخل رقم هاتف كامل (9 أرقام على الأقل)" }, { status: 400 });
    }

    const candidates = Array.from(new Set([rawPhone.trim(), phone].filter(Boolean)));
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .select("id, date, time, status, notes, doctors(name, city, area, phone, whatsapp)")
      .in("patient_phone", candidates)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) throw error;

    const appointments = (data || []).map((row) => sanitizeAppointment(row as Record<string, unknown>));
    return NextResponse.json({ success: true, appointments });
  } catch (err: any) {
    console.error("Patient appointments list error:", err);
    return NextResponse.json({ error: err.message || "تعذر جلب الحجوزات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const rate = withRateLimit(request, "appointments-post", 6, 60_000);
    if (!rate.ok) return rateLimitResponse(rate.retryAfter);

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

    const { data: doctorAccount, error: doctorAccountError } = await supabaseAdmin
      .from("doctor_accounts")
      .select("id, is_active")
      .eq("doctor_id", doctorId)
      .eq("is_active", true)
      .maybeSingle();

    if (doctorAccountError) throw doctorAccountError;
    if (!doctorAccount) {
      return NextResponse.json(
        { error: "الحجز عبر الموقع متاح فقط للأطباء الذين لديهم حساب مفعّل على المنصة." },
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
