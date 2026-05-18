import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, services: [] });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let query = supabase
      .from("medical_services")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (type) query = query.eq("service_type", type);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, services: data || [] });
  } catch (err: any) {
    console.error("List Service Listings Error:", err);
    return NextResponse.json({ success: false, services: [], error: err.message }, { status: 500 });
  }
}
