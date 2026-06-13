import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createSessionToken } from "@/lib/session-token";
import { hashPassword, isPasswordHash, verifyPassword } from "@/lib/passwords";

const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!supabase) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const { data: admin, error } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !admin || !verifyPassword(password, admin.password)) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    if (!isPasswordHash(admin.password)) {
      await supabase.from("admins").update({ password: hashPassword(password) }).eq("id", admin.id);
    }

    // Set cookie using next/server
    const token = createSessionToken({ sub: admin.id, role: "admin", maxAgeSeconds: ADMIN_SESSION_MAX_AGE });
    const response = NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });
    
    // We set a cookie manually on the response object
    response.cookies.set("admin_session", token,
    {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: ADMIN_SESSION_MAX_AGE,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Login API Error:", err);
    return NextResponse.json({ error: "حدث خطأ أثناء تسجيل الدخول" }, { status: 500 });
  }
}
