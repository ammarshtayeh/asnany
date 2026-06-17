import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "قاعدة البيانات غير متاحة" }, { status: 503 });
    }

    const body = await request.json();
    const packageId = String(body.package_id || "");
    const doctorId = body.doctor_id ? String(body.doctor_id) : null;
    const advertiserName = String(body.advertiser_name || body.name || "").trim();
    const advertiserType = String(body.advertiser_type || body.type || "").trim();
    const phone = String(body.phone || "").trim();
    const notes = String(body.notes || "").trim();

    if (!packageId || !advertiserName) {
      return NextResponse.json({ error: "يرجى اختيار الباقة وإدخال اسم المعلن" }, { status: 400 });
    }

    const { data: pkg, error: pkgError } = await supabaseAdmin
      .from("subscription_packages")
      .select("*")
      .eq("id", packageId)
      .eq("is_active", true)
      .single();

    if (pkgError || !pkg) {
      return NextResponse.json({ error: "الباقة غير موجودة" }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from("doctor_subscriptions")
      .insert({
        doctor_id: doctorId,
        package_id: packageId,
        advertiser_name: advertiserName,
        advertiser_type: advertiserType || null,
        status: "pending",
        amount_usd: pkg.price_usd,
        payment_method: body.payment_method || "manual",
        notes: [notes, phone ? `هاتف: ${phone}` : ""].filter(Boolean).join(" | ") || null,
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, subscription: data });
  } catch (error: any) {
    console.error("Subscription request error:", error);
    return NextResponse.json({ error: error.message || "تعذر إرسال طلب الاشتراك" }, { status: 500 });
  }
}
