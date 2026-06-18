import { NextResponse } from "next/server";
import { filterActiveTickerItems } from "@pal-dental/shared";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ items: [] });
    }

    const { data, error } = await supabaseAdmin
      .from("news_ticker_items")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    const items = filterActiveTickerItems(data || []);

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("Ticker fetch error:", error);
    return NextResponse.json({ items: [], error: error.message }, { status: 500 });
  }
}
