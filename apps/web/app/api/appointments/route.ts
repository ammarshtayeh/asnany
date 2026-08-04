import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { notifyDoctorAboutAppointment } from "@/lib/notifications";
import { rateLimitResponse, withRateLimit } from "@/lib/rate-limit";
import {
  ageFromBirthDate,
  generateBookingRef,
  hebronToday,
  isDoctorClosedOnDate,
  isIdentityRequiredForAge,
  isPastAppointment,
  isValidDateString,
  normalizeBookingRef,
  normalizePhone,
  normalizeTimeToHHMM,
} from "@/lib/booking";

const MIN_PHONE_DIGITS = 9;
const MAX_PENDING_PER_PHONE = 5;

function sanitizeAppointment(row: Record<string, unknown>) {
  const doctors = row.doctors as Record<string, unknown> | null | undefined;
  return {
    id: row.id,
    booking_ref: row.booking_ref || null,
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
    const rawPhone = searchParams.get("phone") || "";
    const phone = normalizePhone(rawPhone);
    const bookingRef = normalizeBookingRef(searchParams.get("ref") || searchParams.get("booking_ref"));

    if (phone.length < MIN_PHONE_DIGITS) {
      return NextResponse.json({ error: "أدخل رقم هاتف كامل (9 أرقام على الأقل)" }, { status: 400 });
    }
    if (!bookingRef || bookingRef.length < 6) {
      return NextResponse.json(
        { error: "أدخل رمز الحجز (مثال: MLH-AB12CD) مع رقم الهاتف لمتابعة موعدك بأمان" },
        { status: 400 }
      );
    }

    const phoneCandidates = Array.from(new Set([rawPhone.trim(), phone].filter(Boolean)));
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .select("id, booking_ref, date, time, status, notes, doctors(name, city, area, phone, whatsapp)")
      .eq("booking_ref", bookingRef)
      .in("patient_phone", phoneCandidates)
      .order("date", { ascending: false })
      .limit(5);

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

    // Honeypot — bots fill hidden fields
    if (String(body.website || body.company || "").trim()) {
      return NextResponse.json({ success: true, appointment: { id: "ok" } });
    }

    const doctorId = body.doctor_id;
    const patientFullName = String(body.patient_full_name || body.full_name || "").trim();
    const patientEmail = body.patient_email || body.email || null;
    const patientPhone = normalizePhone(body.patient_phone || body.phone);
    const patientIdentity = String(body.patient_identity || body.identity || "").trim() || null;
    const patientAddress = String(body.patient_address || body.address || "").trim() || null;
    const birthDate = String(body.patient_birth_date || body.birth_date || "").trim();
    const date = String(body.date || "").trim();
    const time = normalizeTimeToHHMM(body.time);
    const notes = String(body.notes || "").trim();

    if (!doctorId || !patientFullName || !patientPhone || !patientAddress || !birthDate || !date || !time) {
      return NextResponse.json(
        { error: "يرجى تعبئة الاسم والهاتف والعنوان وتاريخ الميلاد وتاريخ ووقت الموعد" },
        { status: 400 }
      );
    }

    if (patientPhone.length < MIN_PHONE_DIGITS) {
      return NextResponse.json({ error: "رقم الهاتف غير مكتمل" }, { status: 400 });
    }

    if (!isValidDateString(birthDate)) {
      return NextResponse.json({ error: "تاريخ الميلاد غير صالح" }, { status: 400 });
    }

    const age = ageFromBirthDate(birthDate);
    if (age === null) {
      return NextResponse.json({ error: "تاريخ الميلاد غير منطقي" }, { status: 400 });
    }

    if (isIdentityRequiredForAge(age) && !patientIdentity) {
      return NextResponse.json(
        { error: "رقم الهوية إلزامي لمن عمرهم 17 سنة فأكثر" },
        { status: 400 }
      );
    }

    if (patientIdentity && !/^\d{9}$/.test(patientIdentity)) {
      return NextResponse.json(
        { error: "رقم الهوية يجب أن يكون 9 أرقام" },
        { status: 400 }
      );
    }

    if (!isValidDateString(date)) {
      return NextResponse.json({ error: "تاريخ الموعد غير صالح" }, { status: 400 });
    }

    if (isPastAppointment(date, time)) {
      return NextResponse.json(
        { error: `لا يمكن الحجز في وقت ماضٍ (توقيت فلسطين). اليوم: ${hebronToday()}` },
        { status: 400 }
      );
    }

    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from("doctors")
      .select("id, verified, name, is_available, availability_note, working_hours, active_package_slug")
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

    if (isDoctorClosedOnDate(doctor, date)) {
      return NextResponse.json(
        { error: "العيادة غير متاحة في هذا اليوم. اختر يوماً ضمن الدوام أو تواصل عبر واتساب." },
        { status: 400 }
      );
    }

    const { data: doctorAccount, error: doctorAccountError } = await supabaseAdmin
      .from("doctor_accounts")
      .select("id, is_active")
      .eq("doctor_id", doctorId)
      .eq("is_active", true)
      .maybeSingle();

    if (doctorAccountError) throw doctorAccountError;

    const packageSlug = String(doctor.active_package_slug || "");
    const packageAllowsBooking = packageSlug === "premium";
    if (!doctorAccount && !packageAllowsBooking) {
      return NextResponse.json(
        { error: "الحجز عبر الموقع متاح للباقة المميزة أو بعد تفعيل حساب الطبيب." },
        { status: 403 }
      );
    }

    const { count: pendingCount, error: pendingError } = await supabaseAdmin
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("patient_phone", patientPhone)
      .eq("status", "pending");

    if (pendingError) throw pendingError;
    if ((pendingCount || 0) >= MAX_PENDING_PER_PHONE) {
      return NextResponse.json(
        { error: "لديك طلبات معلّقة كثيرة. انتظر تأكيد العيادة أو تواصل عبر واتساب." },
        { status: 429 }
      );
    }

    const appointmentKey = `${doctorId}:${date}:${time}`;
    const notesWithMeta = [
      notes,
      `تاريخ الميلاد: ${birthDate}`,
      `العمر: ${age} سنة`,
      age < 17 ? "قاصر — الهوية غير مطلوبة حسب سياسة المنصة" : null,
    ]
      .filter(Boolean)
      .join("\n");

    let bookingRef = generateBookingRef();
    let data: {
      id: string;
      doctor_id?: string | null;
      patient_full_name?: string | null;
      patient_name?: string | null;
      patient_phone?: string | null;
      date?: string | null;
      time?: string | null;
      status?: string | null;
      booking_ref?: string | null;
    } | null = null;
    let lastError: any = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const insert = await supabaseAdmin
        .from("appointments")
        .insert([
          {
            doctor_id: doctorId,
            appointment_key: appointmentKey,
            booking_ref: bookingRef,
            patient_name: patientFullName,
            patient_full_name: patientFullName,
            patient_email: patientEmail,
            patient_phone: patientPhone,
            patient_identity: patientIdentity,
            patient_address: patientAddress,
            date,
            time,
            notes: notesWithMeta,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (!insert.error && insert.data?.id) {
        data = insert.data;
        lastError = null;
        break;
      }

      lastError = insert.error;
      if (insert.error.code === "23505" && String(insert.error.message || "").includes("booking_ref")) {
        bookingRef = generateBookingRef();
        continue;
      }
      break;
    }

    if (lastError) throw lastError;
    if (!data) throw new Error("تعذر إنشاء الحجز");

    await notifyDoctorAboutAppointment(data);
    return NextResponse.json({
      success: true,
      appointment: data,
      booking_ref: data.booking_ref,
      message: "تم إرسال طلب الحجز. احفظ رمز الحجز لمتابعة حالتك.",
    });
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
