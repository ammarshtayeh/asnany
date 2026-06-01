import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("doctor_accounts")
      .select("id, doctor_id, email, is_active, created_at, doctors(name, city, phone)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, accounts: data || [] });
  } catch (err: any) {
    console.error("Doctor accounts list error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحميل حسابات الأطباء" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { doctor_id, email, password, is_active = true } = await request.json();
    if (!doctor_id || !email || !password) {
      return NextResponse.json({ error: "الطبيب والبريد وكلمة المرور مطلوبة" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("doctor_accounts")
      .upsert({ doctor_id, email, password, is_active }, { onConflict: "email" })
      .select("id, doctor_id, email, is_active, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, account: data });
  } catch (err: any) {
    console.error("Doctor account create error:", err);
    return NextResponse.json({ error: err.message || "تعذر إنشاء حساب الطبيب" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, is_active, password } = await request.json();
    if (!id) return NextResponse.json({ error: "معرف الحساب مطلوب" }, { status: 400 });

    const update: Record<string, any> = { is_active: Boolean(is_active) };
    if (password) update.password = password;

    const { data, error } = await supabaseAdmin
      .from("doctor_accounts")
      .update(update)
      .eq("id", id)
      .select("id, doctor_id, email, is_active, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, account: data });
  } catch (err: any) {
    console.error("Doctor account update error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحديث حساب الطبيب" }, { status: 500 });
  }
}
