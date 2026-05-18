import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing doctor ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("doctors")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete Doctor Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء حذف الطبيب" }, { status: 500 });
  }
}
