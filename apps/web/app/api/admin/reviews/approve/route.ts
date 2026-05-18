import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { id, is_approved } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing review ID" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("reviews")
      .update({ is_approved })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, review: data });
  } catch (err: any) {
    console.error("Approve Review Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء تعديل اعتماد التقييم" }, { status: 500 });
  }
}
