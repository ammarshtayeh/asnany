import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const doctorId = new URL(request.url).searchParams.get("doctorId");
  if (!doctorId) {
    return NextResponse.json({ error: "doctorId مطلوب" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("id, patient_name, rating, comment, created_at")
    .eq("doctor_id", doctorId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews: data || [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const doctorId = String(body?.doctor_id || "").trim();
  const patientName = String(body?.patient_name || "").trim();
  const rating = Number(body?.rating);
  const comment = String(body?.comment || "").trim();

  if (!doctorId || !patientName || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "الاسم والتقييم (1-5) مطلوبان" }, { status: 400 });
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
}
