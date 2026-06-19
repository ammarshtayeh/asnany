import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase, supabaseAdmin } from "@/lib/supabase";

async function activeBookableDoctorIds() {
  const { data, error } = await supabaseAdmin
    .from("doctor_accounts")
    .select("doctor_id")
    .eq("is_active", true);
  if (error) throw error;
  return new Set((data || []).map((row) => row.doctor_id as string));
}

export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const specialty = searchParams.get("specialty");

    let query = supabase
      .from("doctors")
      .select("id, name, category, specialty, city, area, address, phone, whatsapp, bio, lat, lng, image_url, clinic_photos, rating, verified, is_featured, accepts_insurance, insurance_list, working_hours, is_available, availability_note")
      .eq("verified", true);

    if (city) {
      query = query.eq("city", city);
    }

    const [{ data, error }, bookableIds] = await Promise.all([query, activeBookableDoctorIds()]);

    if (error) throw error;

    let doctors = (data || []).map((doc: any) => ({
      ...doc,
      can_book_online: bookableIds.has(doc.id),
    }));

    if (specialty) {
      doctors = doctors.filter((doc: any) => {
        if (Array.isArray(doc.specialty)) {
          return doc.specialty.some((s: string) => s.toLowerCase() === specialty.toLowerCase());
        }
        return false;
      });
    }

    return NextResponse.json(doctors);
  } catch (err: any) {
    console.error("GET /api/doctors error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch doctors" }, { status: 500 });
  }
}
