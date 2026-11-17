import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({
      verifiedProviders: 0,
      appointments: 0,
      cities: 0,
      activeOffers: 0,
    });
  }

  try {
    const [doctorsRes, appointmentsRes, offersRes] = await Promise.all([
      supabaseAdmin.from("doctors").select("city").eq("verified", true),
      supabaseAdmin.from("appointments").select("id", { count: "exact", head: true }),
      // Same rule as the /offers page: an offer counts while it is still valid.
      supabaseAdmin
        .from("offers")
        .select("id", { count: "exact", head: true })
        .gte("valid_until", new Date().toISOString()),
    ]);

    if (doctorsRes.error) throw doctorsRes.error;
    if (appointmentsRes.error) throw appointmentsRes.error;
    // The offers count only drives navigation, so a failure here must not zero the other stats.
    if (offersRes.error) console.error("Public stats offers count error:", offersRes.error);

    const doctors = doctorsRes.data || [];
    const cities = new Set(
      doctors.map((row) => String(row.city || "").trim()).filter(Boolean)
    );

    return NextResponse.json({
      verifiedProviders: doctors.length,
      appointments: appointmentsRes.count || 0,
      cities: cities.size,
      activeOffers: offersRes.error ? 0 : offersRes.count || 0,
    });
  } catch (error) {
    console.error("Public stats error:", error);
    return NextResponse.json({
      verifiedProviders: 0,
      appointments: 0,
      cities: 0,
      activeOffers: 0,
    });
  }
}
