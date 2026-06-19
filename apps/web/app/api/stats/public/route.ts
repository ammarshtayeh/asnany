import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({
      verifiedProviders: 0,
      appointments: 0,
      cities: 0,
    });
  }

  try {
    const [doctorsRes, appointmentsRes] = await Promise.all([
      supabaseAdmin.from("doctors").select("city").eq("verified", true),
      supabaseAdmin.from("appointments").select("id", { count: "exact", head: true }),
    ]);

    if (doctorsRes.error) throw doctorsRes.error;
    if (appointmentsRes.error) throw appointmentsRes.error;

    const doctors = doctorsRes.data || [];
    const cities = new Set(
      doctors.map((row) => String(row.city || "").trim()).filter(Boolean)
    );

    return NextResponse.json({
      verifiedProviders: doctors.length,
      appointments: appointmentsRes.count || 0,
      cities: cities.size,
    });
  } catch (error) {
    console.error("Public stats error:", error);
    return NextResponse.json({
      verifiedProviders: 0,
      appointments: 0,
      cities: 0,
    });
  }
}
