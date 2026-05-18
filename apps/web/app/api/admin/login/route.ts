import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
      .eq("password", password)
      .single();

    if (error || !admin) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    // Set cookie using next/server
    const response = NextResponse.json({ success: true });
    
    // We set a cookie manually on the response object
    response.cookies.set("admin_session", admin.id, {
      path: "/",
      httpOnly: false, // Accessible by client side if needed, or httpOnly: true
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Login API Error:", err);
    return NextResponse.json({ error: "حدث خطأ أثناء تسجيل الدخول" }, { status: 500 });
  }
}
