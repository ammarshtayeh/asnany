import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { isMissingDiscountMemberTable, normalizeDiscountCardMember } from "@/lib/discount-card-members";

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "قاعدة البيانات غير مهيأة" }, { status: 503 });
    }

    const body = await request.json();
    const payload = normalizeDiscountCardMember(body);
    if (!payload.full_name || payload.phone.length < 7 || !payload.city) {
      return NextResponse.json({ error: "الاسم ورقم الهاتف والمدينة مطلوبة" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("discount_card_members")
      .insert([{ ...payload, status: "pending", created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      if (isMissingDiscountMemberTable(error)) {
        return NextResponse.json({ error: "جدول طلبات بطاقة الخصم غير موجود بعد" }, { status: 503 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, member: data });
  } catch (err: any) {
    console.error("Discount card request error:", err);
    return NextResponse.json({ error: err.message || "تعذر إرسال طلب البطاقة" }, { status: 500 });
  }
}
