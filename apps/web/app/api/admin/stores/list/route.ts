import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, stores: data || [] });
  } catch (err: any) {
    console.error("List Stores Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء تحميل قائمة المتاجر" }, { status: 500 });
  }
}
