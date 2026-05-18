import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, reviews: data || [] });
  } catch (err: any) {
    console.error("List Reviews Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء تحميل التقييمات" }, { status: 500 });
  }
}
