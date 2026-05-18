import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("advertisements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, ads: data || [] });
  } catch (err: any) {
    console.error("List Ads Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء تحميل الإعلانات" }, { status: 500 });
  }
}
