import { NextResponse } from "next/server";
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

    const now = Date.now();
    const items = (data || []).filter((item) => {
      const starts = item.starts_at ? new Date(item.starts_at).getTime() : 0;
      const ends = item.ends_at ? new Date(item.ends_at).getTime() : Number.POSITIVE_INFINITY;
      return now >= starts && now <= ends;
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("Ticker fetch error:", error);
    return NextResponse.json({ items: [], error: error.message }, { status: 500 });
  }
}
