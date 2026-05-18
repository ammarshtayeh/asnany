import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, specialty, city, area, phone, whatsapp, bio, accepts_insurance, image_url, clinic_photos } = body;

    if (!name || !city) {
      return NextResponse.json({ error: "الاسم والمدينة مطلوبان" }, { status: 400 });
    }

    // Prepare doctor structure matching database schema
    const newDoctor = {
      name,
      specialty: Array.isArray(specialty) ? specialty : [specialty],
      city,
      area: area || "",
      phone: phone || "",
      whatsapp: whatsapp || "",
      bio: bio || "",
      accepts_insurance: !!accepts_insurance,
      verified: true, // Admin created doctors are verified by default
      is_featured: false,
      rating: 5.0,
      image_url: image_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop", 
      clinic_photos: Array.isArray(clinic_photos) ? clinic_photos : [],
      working_hours: {
        "السبت": "09:00 ص - 05:00 م",
        "الأحد": "09:00 ص - 05:00 م",
        "الإثنين": "09:00 ص - 05:00 م",
        "الثلاثاء": "09:00 ص - 05:00 م",
        "الأربعاء": "09:00 ص - 05:00 م",
        "الخميس": "09:00 ص - 02:00 م",
        "الجمعة": "مغلق"
      }
    };

    const { data, error } = await supabaseAdmin
      .from("doctors")
      .insert([newDoctor])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, doctor: data });
  } catch (err: any) {
    console.error("Add Doctor Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء إضافة الطبيب" }, { status: 500 });
  }
}
