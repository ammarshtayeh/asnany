import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, doctors: data || [] });
  } catch (err: any) {
    console.error("List Doctors Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء تحميل قائمة الأطباء" }, { status: 500 });
  }
}
