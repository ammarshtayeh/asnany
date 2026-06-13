import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSessionToken } from "@/lib/session-token";
import { hashPassword, isPasswordHash, verifyPassword } from "@/lib/passwords";

const DOCTOR_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" }, { status: 400 });
    }

    const { data: account, error } = await supabaseAdmin
      .from("doctor_accounts")
      .select("id, doctor_id, email, password, is_active, doctors(*)")
      .eq("email", email)
      .eq("is_active", true)
      .single();

    if (error || !account || !verifyPassword(password, account.password)) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة أو الحساب غير مفعل" }, { status: 401 });
    }

    if (!isPasswordHash(account.password)) {
      await supabaseAdmin.from("doctor_accounts").update({ password: hashPassword(password) }).eq("id", account.id);
    }

    const doctor = Array.isArray((account as any).doctors) ? (account as any).doctors[0] : (account as any).doctors;
    const token = createSessionToken({ sub: account.id, role: "doctor", maxAgeSeconds: DOCTOR_SESSION_MAX_AGE });
    const response = NextResponse.json({
      success: true,
      token,
      account: {
        id: account.id,
        doctor_id: account.doctor_id,
        email: account.email,
        is_active: account.is_active,
      },
      doctor,
    });
    response.cookies.set("doctor_session", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: DOCTOR_SESSION_MAX_AGE,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Doctor login error:", err);
    return NextResponse.json({ error: err.message || "تعذر تسجيل الدخول" }, { status: 500 });
  }
}
