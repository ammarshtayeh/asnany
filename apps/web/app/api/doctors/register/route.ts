import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, specialty, city, area, phone, whatsapp, bio, lat, lng } = body;

    if (!name || !city || !specialty) {
      return NextResponse.json({ error: "الرجاء ملء الحقول المطلوبة (الاسم الكامل، المدينة، التخصص)" }, { status: 400 });
    }

    // Insert new doctor request into database as unverified (verified = false)
    const newDoctor = {
      name,
      specialty: Array.isArray(specialty) ? specialty : [specialty],
      city,
      area: area || "",
      phone: phone || "",
      whatsapp: whatsapp || "",
      bio: bio || "",
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      verified: false, // Must be approved by Admin
      is_featured: false,
      accepts_insurance: true,
      rating: 5.0,
      image_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop", // default placeholder
      clinic_photos: [],
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
    console.error("Register Doctor Request Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء إرسال طلب التسجيل" }, { status: 500 });
  }
}
