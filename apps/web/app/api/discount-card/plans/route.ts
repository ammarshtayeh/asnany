import { NextResponse } from "next/server";
import { defaultDiscountCardPlans, isMissingDiscountPlanTable } from "@/lib/discount-card-plans";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, plans: defaultDiscountCardPlans, source: "default" });
    }

    const { data, error } = await supabaseAdmin
      .from("discount_card_plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      if (isMissingDiscountPlanTable(error)) {
        return NextResponse.json({ success: true, plans: defaultDiscountCardPlans, source: "default" });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      plans: data?.length ? data : defaultDiscountCardPlans,
      source: data?.length ? "database" : "default",
    });
  } catch (err: any) {
    console.error("Discount card plans error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحميل باقات بطاقة الخصم" }, { status: 500 });
  }
}
