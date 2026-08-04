import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase, supabaseAdmin } from "@/lib/supabase";
import { cityMatchesFilter } from "@/lib/city-match";

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

    const query = supabase
      .from("doctors")
      .select(
        "id, name, category, specialty, city, area, address, phone, whatsapp, bio, lat, lng, image_url, clinic_photos, rating, verified, is_featured, accepts_insurance, insurance_list, working_hours, is_available, availability_note, active_package_slug"
      )
      .eq("verified", true);

    const [{ data, error }, bookableIds] = await Promise.all([query, activeBookableDoctorIds()]);

    if (error) throw error;

    let doctors = (data || []).map((doc: any) => ({
      ...doc,
      can_book_online: bookableIds.has(doc.id) || doc.active_package_slug === "premium",
    }));

    if (city) {
      doctors = doctors.filter(
        (doc: any) => cityMatchesFilter(doc.city, city) || cityMatchesFilter(doc.area, city)
      );
    }

    if (specialty) {
      doctors = doctors.filter((doc: any) => {
        if (Array.isArray(doc.specialty)) {
          return doc.specialty.some(
            (s: string) => s.toLowerCase() === specialty.toLowerCase() || s.includes(specialty)
          );
        }
        return String(doc.category || "").includes(specialty);
      });
    }

    return NextResponse.json(doctors);
  } catch (err: any) {
    console.error("GET /api/doctors error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch doctors" }, { status: 500 });
  }
}
