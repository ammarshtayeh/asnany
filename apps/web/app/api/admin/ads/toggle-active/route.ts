import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { id, is_active } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing ad ID" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("advertisements")
      .update({ is_active })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, ad: data });
  } catch (err: any) {
    console.error("Toggle Ad Active Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء تعديل حالة الإعلان" }, { status: 500 });
  }
}
