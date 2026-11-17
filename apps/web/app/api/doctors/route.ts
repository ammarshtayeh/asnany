import { NextResponse } from "next/server";
import { cityMatchesFilter } from "@/lib/city-match";
import { fetchPublicDoctors } from "@/lib/public-doctors";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const specialty = searchParams.get("specialty");

    // Already ranked: subscribed clinics first, then by rating.
    let doctors = await fetchPublicDoctors();

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
    // Soft-fail: keep public site usable with an empty list instead of a hard 500 body shape mismatch
    return NextResponse.json([], {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
