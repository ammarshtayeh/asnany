import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json([]);
    }

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("advertisements")
      .select("*")
      .eq("is_active", true)
      .gte("end_date", today)
      .order("display_priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("GET /api/advertisements error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch advertisements" }, { status: 500 });
  }
}
