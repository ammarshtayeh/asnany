import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { notifyDoctorAboutAppointment } from "@/lib/notifications";

function normalizePhone(phone?: string | null) {
  return (phone || "").replace(/[^0-9]/g, "");
}

function normalizeName(name?: string | null) {
  return (name || "").trim().replace(/\s+/g, " ");
}

function escapeIlike(value: string) {
  return value.replace(/[%_]/g, (match) => `\\${match}`);
}

export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, appointments: [] });
    }

    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("query") || searchParams.get("phone") || searchParams.get("name") || "";
    const phone = normalizePhone(rawQuery);
    const name = normalizeName(searchParams.get("name") || rawQuery);

    if (phone.length < 7 && name.length < 3) {
      return NextResponse.json({ error: "أدخل رقم هاتف صحيح أو الاسم الرباعي" }, { status: 400 });
    }

    let query = supabaseAdmin
      .from("appointments")
      .select("*, doctors(name, city, area, phone, whatsapp)")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(30);

    if (phone.length >= 7) {
      const candidates = Array.from(new Set([rawQuery.trim(), phone].filter(Boolean)));
      query = query.in("patient_phone", candidates);
    } else {
      const pattern = `%${escapeIlike(name)}%`;
      query = query.or(`patient_full_name.ilike.${pattern},patient_name.ilike.${pattern}`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, appointments: data || [] });
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
