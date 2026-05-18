import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const specialty = searchParams.get("specialty");

    let query = supabase
      .from("doctors")
      .select("*")
      .eq("verified", true); // Only verified doctors for public listing

    if (city) {
      query = query.eq("city", city);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Filter by specialty client-side if it's stored as a JSON array
    let doctors = data || [];
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
