import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { jsonError, readJsonBody } from "@/lib/http";

export async function GET(request: Request) {
  try {
    const doctorId = new URL(request.url).searchParams.get("doctorId");
    if (!doctorId) {
      return NextResponse.json({ error: "doctorId مطلوب" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ reviews: [] });
    }

    const { data, error } = await supabaseAdmin
      .from("reviews")
      .select("id, patient_name, rating, comment, created_at")
      .eq("doctor_id", doctorId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message, reviews: [] }, { status: 500 });
    }

    return NextResponse.json({ reviews: data || [] });
  } catch (error) {
    return jsonError(error, "تعذر جلب التقييمات");
  }
}

export async function POST(request: Request) {
  try {
    const parsed = await readJsonBody<{
      doctor_id?: string;
      patient_name?: string;
      rating?: number;
      comment?: string;
    }>(request);
    if (!parsed.ok) return parsed.response;

    const doctorId = String(parsed.body?.doctor_id || "").trim();
    const patientName = String(parsed.body?.patient_name || "").trim();
    const rating = Number(parsed.body?.rating);
    const comment = String(parsed.body?.comment || "").trim();

    if (!doctorId || !patientName || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "الاسم والتقييم (1-5) مطلوبان" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "الخدمة غير متاحة حالياً" }, { status: 503 });
    }

    const { error } = await supabaseAdmin.from("reviews").insert({
      doctor_id: doctorId,
      patient_name: patientName,
      rating,
      comment: comment || null,
      is_approved: false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "شكراً! سيُراجع تقييمك قبل النشر لحماية جودة التجارب.",
    });
  } catch (error) {
    return jsonError(error, "تعذر إرسال التقييم");
  }
}
