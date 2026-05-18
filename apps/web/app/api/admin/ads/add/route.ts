import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { advertiser_name, advertiser_type, ad_type, image_url, link_url, end_date } = await request.json();

    if (!advertiser_name || !image_url) {
      return NextResponse.json({ error: "اسم المعلن وصورة الإعلان مطلوبان" }, { status: 400 });
    }

    const newAd = {
      advertiser_name,
      advertiser_type: advertiser_type || "doctor",
      ad_type: ad_type || "banner",
      image_url,
      link_url: link_url || "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      is_active: true,
      clicks: 0
    };

    const { data, error } = await supabaseAdmin
      .from("advertisements")
      .insert([newAd])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, ad: data });
  } catch (err: any) {
    console.error("Add Advertisement Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء إضافة الإعلان" }, { status: 500 });
  }
}
