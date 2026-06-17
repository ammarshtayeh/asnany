import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ packages: [] });
    }

    const { data, error } = await supabaseAdmin
      .from("subscription_packages")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ packages: data || [] });
  } catch (error: any) {
    console.error("Packages fetch error:", error);
    return NextResponse.json({ packages: [], error: error.message }, { status: 500 });
  }
}
