import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, specialty, city, area, phone, whatsapp, bio, accepts_insurance, image_url, clinic_photos } = body;

    if (!id || !name || !city) {
      return NextResponse.json({ error: "معرف الطبيب والاسم والمدينة مطلوبة" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("doctors")
      .update({
        name,
        specialty: Array.isArray(specialty) ? specialty : [specialty],
        city,
        area: area || "",
        phone: phone || "",
        whatsapp: whatsapp || "",
        bio: bio || "",
        accepts_insurance: !!accepts_insurance,
        image_url: image_url || undefined,
        clinic_photos: Array.isArray(clinic_photos) ? clinic_photos : [],
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, doctor: data });
  } catch (err: any) {
    console.error("Edit Doctor Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء تعديل بيانات الطبيب" }, { status: 500 });
  }
}
