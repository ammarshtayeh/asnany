import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing ad ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("advertisements")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete Ad Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء حذف الإعلان" }, { status: 500 });
  }
}
