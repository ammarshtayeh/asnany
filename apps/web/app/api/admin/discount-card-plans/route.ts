import { NextResponse } from "next/server";
import {
  defaultDiscountCardPlans,
  isMissingDiscountPlanTable,
  normalizeDiscountCardPlan,
} from "@/lib/discount-card-plans";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

function validate(payload: ReturnType<typeof normalizeDiscountCardPlan>) {
  return Boolean(payload.name && payload.price >= 0 && payload.duration_months > 0 && payload.benefits.length);
}

function tableMissingResponse() {
  return NextResponse.json(
    {
      error: "جدول باقات بطاقة الخصم غير موجود بعد. شغّل migration: 202606130001_discount_card_plans.sql",
    },
    { status: 503 },
  );
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, plans: defaultDiscountCardPlans, storageReady: false });
    }

    const { data, error } = await supabaseAdmin
      .from("discount_card_plans")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      if (isMissingDiscountPlanTable(error)) {
        return NextResponse.json({ success: true, plans: defaultDiscountCardPlans, storageReady: false });
      }
      throw error;
    }

    return NextResponse.json({ success: true, plans: data || [], storageReady: true });
  } catch (err: any) {
    console.error("Admin discount plans list error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحميل الباقات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase غير مهيأ" }, { status: 503 });
    }

    const body = await request.json();
    const payload = normalizeDiscountCardPlan(body);
    if (!validate(payload)) {
      return NextResponse.json({ error: "اسم الباقة والسعر والمدة والمزايا مطلوبة" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("discount_card_plans")
      .insert([{ ...payload, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      if (isMissingDiscountPlanTable(error)) return tableMissingResponse();
      throw error;
    }

    return NextResponse.json({ success: true, plan: data });
  } catch (err: any) {
    console.error("Admin discount plans create error:", err);
    return NextResponse.json({ error: err.message || "تعذر إنشاء الباقة" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase غير مهيأ" }, { status: 503 });
    }

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "معرف الباقة مطلوب" }, { status: 400 });
    }

    const payload = normalizeDiscountCardPlan(body);
    if (!validate(payload)) {
      return NextResponse.json({ error: "اسم الباقة والسعر والمدة والمزايا مطلوبة" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("discount_card_plans")
      .update(payload)
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      if (isMissingDiscountPlanTable(error)) return tableMissingResponse();
      throw error;
    }

    return NextResponse.json({ success: true, plan: data });
  } catch (err: any) {
    console.error("Admin discount plans update error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحديث الباقة" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase غير مهيأ" }, { status: 503 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "معرف الباقة مطلوب" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("discount_card_plans").delete().eq("id", id);
    if (error) {
      if (isMissingDiscountPlanTable(error)) return tableMissingResponse();
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin discount plans delete error:", err);
    return NextResponse.json({ error: err.message || "تعذر حذف الباقة" }, { status: 500 });
  }
}
