import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing store ID" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("stores")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete Store Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء حذف المتجر" }, { status: 500 });
  }
}
