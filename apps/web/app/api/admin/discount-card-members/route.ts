import { NextResponse } from "next/server";
import {
  isMissingDiscountMemberTable,
  normalizeDiscountCardMember,
} from "@/lib/discount-card-members";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

function tableMissingResponse() {
  return NextResponse.json(
    { error: "جدول طلبات بطاقة الخصم غير موجود بعد. شغّل migration: 202606130002_discount_card_members.sql" },
    { status: 503 },
  );
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, members: [], storageReady: false });
    }

    const { data, error } = await supabaseAdmin
      .from("discount_card_members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (isMissingDiscountMemberTable(error)) {
        return NextResponse.json({ success: true, members: [], storageReady: false });
      }
      throw error;
    }

    return NextResponse.json({ success: true, members: data || [], storageReady: true });
  } catch (err: any) {
    console.error("Admin discount card members list error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحميل طلبات بطاقة الخصم" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase غير مهيأ" }, { status: 503 });
    }

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "معرف الطلب مطلوب" }, { status: 400 });
    }

    const payload = normalizeDiscountCardMember(body);
    if (!payload.full_name || payload.phone.length < 7) {
      return NextResponse.json({ error: "الاسم ورقم الهاتف مطلوبان" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("discount_card_members")
      .update(payload)
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      if (isMissingDiscountMemberTable(error)) return tableMissingResponse();
      throw error;
    }

    return NextResponse.json({ success: true, member: data });
  } catch (err: any) {
    console.error("Admin discount card member update error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحديث طلب البطاقة" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase غير مهيأ" }, { status: 503 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "معرف الطلب مطلوب" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("discount_card_members").delete().eq("id", id);
    if (error) {
      if (isMissingDiscountMemberTable(error)) return tableMissingResponse();
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin discount card member delete error:", err);
    return NextResponse.json({ error: err.message || "تعذر حذف طلب البطاقة" }, { status: 500 });
  }
}
