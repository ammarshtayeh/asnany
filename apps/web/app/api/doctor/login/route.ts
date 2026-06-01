import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" }, { status: 400 });
    }

    const { data: account, error } = await supabaseAdmin
      .from("doctor_accounts")
      .select("id, doctor_id, email, is_active")
      .eq("email", email)
      .eq("password", password)
      .eq("is_active", true)
      .single();

    if (error || !account) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة أو الحساب غير مفعل" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("doctor_session", account.id, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Doctor login error:", err);
    return NextResponse.json({ error: err.message || "تعذر تسجيل الدخول" }, { status: 500 });
  }
}
