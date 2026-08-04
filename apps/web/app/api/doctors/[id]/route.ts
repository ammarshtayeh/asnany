import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase, supabaseAdmin } from "@/lib/supabase";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isSupabaseConfigured || !id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: doctor, error } = await supabase
      .from("doctors")
      .select("id, name, category, specialty, city, area, address, phone, whatsapp, bio, lat, lng, image_url, clinic_photos, rating, verified, is_featured, accepts_insurance, insurance_list, working_hours, is_available, availability_note, accepts_discount_card, active_package_slug")
      .eq("id", id)
      .eq("verified", true)
      .single();

    if (error || !doctor) {
      return NextResponse.json({ error: "الطبيب غير موجود" }, { status: 404 });
    }

    const { data: account } = await supabaseAdmin
      .from("doctor_accounts")
      .select("id")
      .eq("doctor_id", id)
      .eq("is_active", true)
      .maybeSingle();

    return NextResponse.json({
      doctor,
      can_book_online: Boolean(account) || doctor.active_package_slug === "premium",
    });
  } catch (err: any) {
    console.error("GET /api/doctors/[id] error:", err);
    return NextResponse.json({ error: err.message || "تعذر جلب بيانات الطبيب" }, { status: 500 });
  }
}
