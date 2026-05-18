import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { doctor_id, lat, lng } = await request.json();

    if (!doctor_id || !lat || !lng) {
      return NextResponse.json({ error: "البيانات المدخلة غير كاملة" }, { status: 400 });
    }

    // Update doctor's coordinates in database
    const { data, error } = await supabaseAdmin
      .from("doctors")
      .update({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      })
      .eq("id", doctor_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, doctor: data });
  } catch (err: any) {
    console.error("Set Doctor Location Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء حفظ الموقع" }, { status: 500 });
  }
}
