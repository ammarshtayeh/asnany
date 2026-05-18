import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { id, is_featured } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing doctor ID" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("doctors")
      .update({ is_featured })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, doctor: data });
  } catch (err: any) {
    console.error("Toggle Featured Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء تعديل تمييز الطبيب" }, { status: 500 });
  }
}
